import express from 'express'
import axios from 'axios'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080
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
        credentials: true,
        origin: '*',
    }),
)
app.use(bodyParser.json())

// Route to handle the redirection after the user clicks "Sign in with X"
app.post('/api/x/signup', async (req, res) => {
    try {
        const preliminaryUrl = req.body.returnUrl.replace(/\/$/, '')
        const finalRedirectUrl = `${preliminaryUrl}/x-callback?token=`
        const whitelistFailureUrl = `${preliminaryUrl}/not-whitelisted`
        const response = await axios.post(`${API_URL}/x/get-redirect-url`, {
            finalRedirectUrl,
            whitelistFailureUrl,
        },
            {
                headers: {
                    client_id: 2,
                },
            },
        )
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

app.post('/api/dial-installed', async (req, res) => {
    const { token, nodeUrl } = req.body
    try {
        const response = await axios({
            method: 'GET',
            url: `${nodeUrl}/curator:dial:uncentered.os`,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        res.sendStatus(response.status)
    } catch (error) {
        console.error('Error checking dial installed:', error)
        res.status(500).send('Failed to check dial installed')
    }
})

// Add new endpoint to proxy node login requests
app.post('/api/node-login', async (req, res) => {
    const { nodeUrl, passwordHash, subdomain, redirect } = req.body

    try {
        const response = await axios({
            method: 'POST',
            url: `${nodeUrl}/login`,
            params: { redirect },
            data: {
                password_hash: passwordHash,
                subdomain,
            },
            headers: {
                'Content-Type': 'application/json',
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        })

        // Parse the target domain from nodeUrl
        const targetDomain = new URL(nodeUrl).hostname;

        // Forward ALL headers from the node's response
        Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        res.json({
            redirectUrl: response.headers.location,
            success: true,
            headers: response.headers,
            status: response.status
        });
    } catch (error) {
        console.error('Error proxying node login:', error)
        res.status(500).send('Failed to login to node')
    }
})

// Load environment variable
const NODE_PASSWORD_SECRET = process.env.NODE_PASSWORD_SECRET;
if (!NODE_PASSWORD_SECRET) {
    throw new Error('NODE_PASSWORD_SECRET environment variable is required');
}

// Add new endpoint for password derivation
app.post('/api/derive-node-password', async (req, res) => {
    const { userId, serviceType } = req.body;

    if (!userId || !serviceType) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const encoder = new TextEncoder();
        const staticSalt = `${userId}:${serviceType}:v1`;

        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(NODE_PASSWORD_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(staticSalt)
        );

        const derivedPassword = Buffer.from(signature).toString('base64');
        res.json({ password: derivedPassword });
    } catch (error) {
        console.error('Error deriving password:', error);
        res.status(500).json({ error: 'Failed to derive password' });
    }
});

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

        // Handle 304 Not Modified separately since it won't have response data
        if (response.status === 304) {
            return res.sendStatus(304)
        }

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
