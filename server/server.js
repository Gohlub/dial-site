import express from 'express'
import axios from 'axios'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
const PORT = process.env.NODE_ENV === 'production' ? 8081 : 8082
const API_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://api.hosting.kinode.net'
        : 'https://api.staging.kinode.net'

app.use(
    cors({
        allowedHeaders: [
            'Authorization',
            'Content-Type',
            'Accept',
            'client_id',
        ],
        origin: '*',
    }),
)
app.use(bodyParser.json())

// Route to handle the redirection after the user clicks "Sign in with X"
app.post('/api/get-x-redirect-url', async (req, res) => {
    try {
        const preliminaryUrl = req.body.returnUrl.replace(/\/$/, '')
        const finalRedirectUrl = `${preliminaryUrl}/process-token?token=`
        const whitelistFailureUrl = `${preliminaryUrl}/not-whitelisted`
        const response = await axios.post(`${API_URL}/x/get-redirect-url`, {
            finalRedirectUrl,
            whitelistFailureUrl,
        })
        const { url } = response.data
        res.send(url)
    } catch (error) {
        console.error('Error fetching redirect URL:', error)
        res.status(500).send('Internal Server Error')
    }
})

app.get('/api/sanity-check', (req, res) => {
    res.sendStatus(200)
})

// redirect all other requests to api.{IS_PROD ? 'hosting' : 'staging'}.kinode.net
app.all('*', async (req, res) => {
    const { method, path, body, query, headers: h } = req
    const apiUrl = `${API_URL}${path}`.replace('api/', '')
    const headers = { ...h, host: new URL(apiUrl).host }
    try {
        const response = await axios({
            method,
            url: apiUrl,
            data: body,
            params: query,
            headers,
        })

        res.status(response.status).json(response.data)
    } catch (error) {
        console.error('Error proxying request:', error)
        res.status(error.response ? error.response.status : 500).send(
            error.response ? error.response.data : 'Internal Server Error',
        )
    }
})

app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode at http://localhost:${PORT}`,
    )
})
