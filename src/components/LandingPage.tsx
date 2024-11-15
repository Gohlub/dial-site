import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../utilities/dimensions'

const carouselImages = [
    {
        src: '/carousel/feeds.png',
        alt: 'Dial feed interface',
        title: 'Bespoke Feeds',
        description: 'Tune your stations using AI queries to explore Dial\'s unique curated map of the internet'
    },
    {
        src: '/carousel/feeds2.png',
        alt: 'Dial stations interface',
        title: 'The Only Feed You Need',
        description: 'Surface the best content from across the internet, including social media, videos, blogs, podcasts, and more'
    },
    {
        src: '/carousel/feeds3.png',
        alt: 'Dial community interface',
        title: 'Join a Community of Early Adopters',
        description: 'A novel social experience for tech-first tastemakers'
    },
    // Add more carousel images as needed
]

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
    const isMobile = useIsMobile()
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    return (
        <div className="landing-page bg-white flex flex-col items-center justify-center bg-gradient-to-b from-white to-orange/10 max-w-screen">
            <motion.div
                className="w-full md:max-w-4xl mx-auto px-4 py-16 text-center flex flex-col items-center"
                {...fadeIn}
            >
                <h1 className="text-6xl mb-6 font-normal md:font-bold">{isMobile ? `Dial: the new social media` : 'Welcome to Dial'}</h1>
                <p className="text-xl mb-8 text-gray-700">
                    {isMobile ? 'Curators pull in the best content from across the internet, including social media, video, podcast, blogs and more.' : 'The modern social protocol for cataloging and discovering content across the internet and beyond'}
                </p>
                <button
                    onClick={onGetStarted}
                    className="bg-orange text-white px-4 md:px-8 py-3 rounded-full text-lg hover:bg-orange-600 transition-colors"
                >
                    Get started
                </button>
            </motion.div>

            <motion.div
                className="w-full md:max-w-6xl mx-auto px-4 mb-16"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <img
                    src="/app-preview.png"
                    alt="Dial application interface"
                    className="w-full rounded-lg"
                />
            </motion.div>

            <motion.div
                className="grid md:grid-cols-3 gap-12 max-w-3/4 md:max-w-6xl mx-auto px-4 md:px-32 py-16"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
            >
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <img src="/icons/personalization.svg" alt="Personalization" className="w-full h-full" />
                    </div>
                    <p className="text-gray-600">
                        Personalized stations serve high quality content to feeds custom tailored to your interests
                    </p>
                </div>

                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <img src="/icons/curation.svg" alt="Curation" className="w-full h-full" />
                    </div>
                    <p className="text-gray-600">
                        Human curation and AI discovery combine to surface the best of the web
                    </p>
                </div>

                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <img src="/icons/extensible.svg" alt="Extensible" className="w-full h-full" />
                    </div>
                    <p className="text-gray-600">
                        Permissionless protocol enables third-party development of novel extensions
                    </p>
                </div>
            </motion.div>

            <motion.div
                className="w-full md:w-3/4 py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="max-w-6xl mx-auto px-4">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        navigation
                        autoplay={{ delay: 5000 }}
                        loop={true}
                        className="rounded-2xl p-8 bg-orange/25"
                    >
                        {carouselImages.map((image, index) => (
                            <SwiperSlide key={index} className="flex flex-col items-center px-8 md:px-0">
                                <h2 className="text-3xl text-center mb-12">{image.title}</h2>
                                <p className="text-center text-gray-600 mb-8">
                                    {image.description}
                                </p>
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-3/4 md:w-1/2 h-auto"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </motion.div>

            <motion.div
                className="w-full py-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <div className="max-w-4xl mx-auto text-center px-4 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <img
                            src="/dial-circle.svg"
                            alt="Dial Logo"
                            className="w-64 h-64 md:w-128 md:h-128 mx-auto mb-8"
                        />
                    </motion.div>
                    {/* <h2 className="text-4xl mb-6">Ready to get started?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join the modern social protocol for content discovery
                    </p> */}
                    <button
                        onClick={onGetStarted}
                        className="bg-orange text-white px-8 py-3 rounded-full text-lg hover:bg-orange-600 transition-colors"
                    >
                        Get started
                    </button>
                </div>
            </motion.div>

            <footer className="w-full bg-orange text-white px-16 py-12 flex flex-row items-center justify-between">
                <img src="/DIAL_white.svg" alt="Dial Logo" className="h-8" />
                <Link to="#" onClick={onGetStarted} className="text-white decoration-none font-normal text-xl">Sign up</Link>
            </footer>

            {/* <footer className="w-full bg-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <img src="/DIAL.svg" alt="Dial Logo" className="h-8 mb-4" />
                            <p className="text-gray-600">
                                The modern social protocol for cataloging and discovering content
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#features">Features</a></li>
                                <li><a href="#pricing">Pricing</a></li>
                                <li><a href="#docs">Documentation</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="https://uncentered.systems">About Us</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/privacy">Privacy Policy</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Connect</h4>
                            <ul className="space-y-2">
                                <li><a href="https://twitter.com/UncenteredSys">Twitter</a></li>
                                <li><a href="https://discord.gg/gXdG9UDPtm">Discord</a></li>
                                <li><a href="https://github.com/kinode-dao">GitHub</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
                        <p>&copy; {new Date().getFullYear()} Uncentered Systems. All rights reserved.</p>
                    </div>
                </div>
            </footer> */}
        </div>
    )
} 