'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, User, LogOut, Settings, Trophy, Upload, Sparkles, Target, Code, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { ThemeToggle } from '@/components/theme-toggle'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Home', href: '/', icon: Sparkles },
    { name: 'Analyze', href: '/#analyzer', icon: Target },
    { name: 'Code Analyzer', href: '/code-analyzer', icon: Code },
    { name: 'Marketplace', href: '/marketplace', icon: Store },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href === '/#analyzer') {
      return pathname === '/' // Special case for anchor link
    }
    return pathname.startsWith(href)
  }

  const handleNavClick = (href: string) => {
    if (href === '/#analyzer') {
      if (pathname === '/') {
        document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })
      } else {
        // Use router.push instead of window.location.href to preserve auth
        router.push('/')
        setTimeout(() => {
          document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg' 
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20 dark:border-gray-800/20'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold gradient-text">BiasBounty</span>
                <div className="text-xs text-gray-500 -mt-1">AI Bias Hunter</div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item.href.startsWith('/#') ? (
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-violet-50 hover:text-violet-600 ${
                      isActive(item.href)
                        ? 'bg-violet-100 text-violet-600'
                        : 'text-gray-600'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-violet-50 hover:text-violet-600 ${
                      isActive(item.href)
                        ? 'bg-violet-100 text-violet-600'
                        : 'text-gray-600'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/60 transition-all">
                    <Link href="/datasets/upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Dataset
                    </Link>
                  </Button>
                </motion.div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-violet-200 transition-all duration-300">
                      <Avatar className="h-10 w-10 border-2 border-violet-200">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium leading-none">{user.username}</p>
                          <Badge variant="secondary" className="text-xs">Level {user.level || 1}</Badge>
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-violet-600">
                          <Sparkles className="w-3 h-3" />
                          <span>{user.points || 0} points</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard">
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Leaderboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wallet">
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Wallet</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-3"
              >
                <Button asChild variant="ghost" className="hover:bg-violet-50 hover:text-violet-600">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild className="btn-primary">
                  <Link href="/auth/signup">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Join Free
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-violet-50"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50"
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {item.href.startsWith('/#') ? (
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className={`flex items-center space-x-3 w-full p-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-violet-50 hover:text-violet-600 ${
                        isActive(item.href)
                          ? 'bg-violet-100 text-violet-600'
                          : 'text-gray-600'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-violet-50 hover:text-violet-600 ${
                        isActive(item.href)
                          ? 'bg-violet-100 text-violet-600'
                          : 'text-gray-600'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </motion.div>
              ))}
              
              {user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="pt-4 border-t border-gray-200 space-y-4"
                >
                  <div className="flex items-center space-x-3 p-3 bg-violet-50 rounded-lg">
                    <Avatar className="h-10 w-10 border-2 border-violet-200">
                      <AvatarImage src={user.avatar_url} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{user.username}</p>
                        <Badge variant="secondary" className="text-xs">Level {user.level || 1}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-1 text-xs text-violet-600 mt-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{user.points || 0} points</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full btn-primary">
                    <Link href="/datasets/upload" onClick={() => setIsOpen(false)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Dataset
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="pt-4 border-t border-gray-200 space-y-3"
                >
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-full btn-primary">
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Join Free
                    </Link>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
