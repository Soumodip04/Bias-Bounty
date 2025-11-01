'use client'

import { motion } from 'framer-motion'
import { Shield, Target, Users, Award, TrendingUp, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: 'Bias Detection',
      description: 'Advanced algorithms to identify various forms of bias in datasets and code'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Collaborate with a global community of data scientists and developers'
    },
    {
      icon: Award,
      title: 'Gamified Learning',
      description: 'Earn points, level up, and compete on leaderboards while making a difference'
    },
    {
      icon: TrendingUp,
      title: 'Real Impact',
      description: 'Help organizations build fairer, more inclusive AI and data systems'
    },
  ]

  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'Datasets Analyzed', value: '50,000+' },
    { label: 'Biases Detected', value: '25,000+' },
    { label: 'Organizations Helped', value: '500+' },
  ]

  const team = [
    {
      name: 'BiasBounty Team',
      role: 'Mission-Driven Developers',
      description: 'A passionate team dedicated to making AI fairer and more inclusive for everyone.'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-3 mb-6">
            <Shield className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BiasBounty
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Making AI fairer, one dataset at a time. We're on a mission to democratize bias detection 
            and empower communities to build more equitable technology.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg">Join the Mission</Button>
            </Link>
            <Link href="/datasets">
              <Button size="lg" variant="outline">Explore Datasets</Button>
            </Link>
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardContent className="pt-12 pb-12 text-center">
              <Target className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg max-w-3xl mx-auto leading-relaxed">
                BiasBounty exists to combat bias in AI and data systems through community-driven detection 
                and analysis. We believe that by gamifying the process of finding and fixing biases, we can 
                create a more engaged community and accelerate progress toward fair and inclusive technology 
                for all.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm text-center">
                  <CardContent className="pt-6 pb-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm h-full hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Upload or Analyze',
                description: 'Submit datasets for analysis or review existing ones from the community'
              },
              {
                step: '2',
                title: 'Detect Bias',
                description: 'Our AI-powered tools identify potential biases in demographics, language, and patterns'
              },
              {
                step: '3',
                title: 'Earn & Learn',
                description: 'Get rewarded for finding biases, level up, and help make AI more fair'
              },
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
          <div className="max-w-2xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 max-w-xl mx-auto">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of data scientists, developers, and researchers working together 
                to build a fairer future for AI.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  Get Started Today
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
