import Head from 'next/head'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import DemoBooking from '../components/DemoBooking'
import Footer from '../components/Footer'

export default function Home({ user, setUser }) {
  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>eRepairing.com - AI-First Service Management Platform</title>
        <meta name="description" content="AI-first, India-focused Service Management Platform for device manufacturers" />
      </Head>
      <Header user={user} setUser={setUser} />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <DemoBooking />
      </main>
      <Footer />
    </div>
  )
}
