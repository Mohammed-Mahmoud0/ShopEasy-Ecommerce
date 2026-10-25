import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { CartDrawer } from '../components/cart/CartDrawer'
import { Toaster } from '../components/ui/Toaster'

export function RootLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col text-app">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toaster />
    </div>
  )
}
