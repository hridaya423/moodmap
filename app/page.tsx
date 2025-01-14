'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, TrendingUp, Users, ArrowRight, Github, Menu, X, Share2, ChartArea 
} from 'lucide-react';
import MapPreview from '@/components/preview';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-3xl -top-40 -right-40 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl -bottom-40 -left-40 animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.1),transparent)]" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl" />
      </div>

      <div className="fixed inset-0 pointer-events-none -z-5">
      </div>

      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg' : ''
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 bg-clip-text text-transparent">
                <img src="/logo.png" className='w-24' />
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/analysis" 
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full hover:shadow-lg transition-all hover:-translate-y-0.5 hover:scale-105"
              >
                Start Analyzing
              </Link>
            </div>
            <button 
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-white/90 backdrop-blur-xl z-40 transition-transform duration-500 ${
        menuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col space-y-6">
            <Link
              href="/analysis"
              className="text-2xl font-semibold text-gray-800 hover:text-teal-500 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Start Analyzing
            </Link>
          </div>
        </div>
      </div>

      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className={`text-center transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="inline-block animate-float">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-green-500/10 border border-teal-500/20 backdrop-blur-sm">
                  <span className="bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent font-medium">
                    Now Available • Start Analyzing
                  </span>
                </div>
              </div>

              <h1 className="mt-8 text-6xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 bg-clip-text text-transparent">
                  Global Sentiment
                </span>
                <br />
                <span className="text-gray-900">
                  At Your Fingertips
                </span>
              </h1>

              <p className="mt-8 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Experience real-time global sentiment analysis powered by advanced AI and millions of social conversations.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/analysis" 
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full text-lg font-semibold hover:shadow-xl transition-all hover:-translate-y-0.5 hover:scale-105 focus:ring-4 focus:ring-teal-500/20"
                >
                  <span className="flex items-center justify-center">
                    Start Analyzing
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  <span>Global Coverage</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  <span>195+ Countries</span>
                </div>
              </div>
            </div>
            <div className="mt-20 relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent h-40 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent h-40 bottom-0 z-10" />
              
              <div className="bg-white rounded-3xl shadow-2xl p-6 relative z-0 transform group-hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex space-x-4">
                    {['Global', 'Regional', 'Local'].map((tab, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          activeFeature === index
                            ? 'bg-gradient-to-r from-teal-500/10 to-green-500/10 text-teal-700'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-50 relative">
                  <MapPreview activeFeature={activeFeature} />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                      activeFeature === 0 ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-teal-500" />
                        Global Sentiment Overview
                      </div>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                      activeFeature === 1 ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-teal-500" />
                        Regional Analysis
                      </div>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                      activeFeature === 2 ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 flex items-center">
                        <ChartArea className="w-5 h-5 mr-2 text-teal-500" />
                        Local Insights
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-full blur-xl opacity-50" />
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full blur-xl opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-8 h-8" />,
                color: 'from-blue-500 to-teal-500',
                title: 'Global Coverage',
                description: 'Real-time sentiment analysis across all continents'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                color: 'from-teal-500 to-green-500',
                title: 'Live Updates',
                description: 'Continuous analysis of social media trends'
              },
              {
                icon: <Users className="w-8 h-8" />,
                color: 'from-green-500 to-emerald-500',
                title: 'Community Insights',
                description: 'Powered by millions of global conversations'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group relative transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-teal-500/20 transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-0.5 mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent">
            <img src="/logo.png" className='w-24' />
            </div>
            <div className="flex items-center justify-center space-x-6">
              <a href="https://github.com/hridaya423/moodmap" className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-full">
                <Github className="w-5 h-5" />
              </a>
              
            </div>
            <div className="text-sm text-gray-500">
              © 2024 MoodMap. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
