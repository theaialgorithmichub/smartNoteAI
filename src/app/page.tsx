import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { HeroSection } from '@/components/home/hero-section'
import { BookshelfSection } from '@/components/home/bookshelf-section'
import { FeaturesSection } from '@/components/home/features-section'
import { CTASection } from '@/components/home/cta-section'
import { Footer } from '@/components/home/footer'
import { Navbar } from '@/components/ui/navbar'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black transition-colors">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section with 3D Spline */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Bookshelf Preview */}
      <BookshelfSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  )
}

