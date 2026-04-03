import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import DemoBooking from '../components/DemoBooking'
import Footer from '../components/Footer'
import { Button } from '../components/ui/button'
import { Building2, ArrowRight } from 'lucide-react'

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
        {/* Sign up your organization - homepage CTA */}
        <section className="py-12 px-4 bg-primary/5 border-y border-border">
          <div className="container mx-auto max-w-4xl text-center">
            <Building2 className="mx-auto mb-4 text-primary" size={40} />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Sign up your organization
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Create your organization, set up your admin account, and choose a plan. Start in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="hero" size="lg" className="group">
                  Sign up your org
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/customer-signup">
                <Button variant="outline" size="lg">
                  I&apos;m a customer – sign up
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <Features />
        <Pricing />
        <DemoBooking />
      </main>
      <Footer />
    </div>
  )
}
