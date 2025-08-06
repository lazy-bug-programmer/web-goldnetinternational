"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Shield,
  Users,
  Globe,
  Star,
  ChevronDown,
  ChevronUp,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StockChartWidget from "@/components/stock-chart-widget";
import PlatformFeatureChartWidget from "@/components/platform-features-chart-widget";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  const faqData = [
    {
      question: "How do I get started with trading on Gold Net International?",
      answer:
        "Getting started is easy! Simply create a free account, complete the verification process, and you can begin trading immediately with our demo account. Once you're ready, you can fund your live account and start trading with real money.",
    },
    {
      question: "What trading platforms do you offer?",
      answer:
        "We offer multiple trading platforms including our advanced web platform, mobile apps for iOS and Android, and a professional desktop application. All platforms feature real-time charts, advanced analysis tools, and seamless execution.",
    },
    {
      question: "What is the minimum deposit required?",
      answer:
        "Our minimum deposit is $100, making trading accessible to everyone. We support various payment methods including bank transfers, credit cards, and popular e-wallets for your convenience.",
    },
    {
      question: "Is my money safe with Gold Net International?",
      answer:
        "Absolutely. We employ bank-level security with advanced encryption, multi-factor authentication, and segregated client accounts. We are fully regulated and your funds are protected by investor compensation schemes.",
    },
    {
      question: "What markets can I trade?",
      answer:
        "You can trade a wide range of markets including Forex (50+ currency pairs), commodities (gold, silver, oil), major stock indices, and popular cryptocurrencies. All markets are available 24/7 depending on market hours.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes, we provide 24/7 customer support through live chat, email, and phone. Our expert support team is always ready to help you with any questions or technical issues you may encounter.",
    },
  ];

  const handleFaqToggle = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
    // You can add actual subscription logic here
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Trade with
                  <span className="text-green-600 dark:text-green-400 block">
                    Confidence
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Join thousands of traders who trust Gold Net International for
                  their trading journey. Advanced tools, real-time data, and
                  expert support.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4"
                >
                  Start Trading Now
                  <ArrowRight className="ml-2 h-4 lg:h-5 w-4 lg:w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex items-center justify-between sm:justify-start sm:space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    50K+
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                    Active Traders
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    $2B+
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                    Trading Volume
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    24/7
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                    Support
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-first lg:order-last">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 h-96 lg:h-[500px]">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                      Live Trading Dashboard
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Live
                      </span>
                    </div>
                  </div>

                  {/* TradingView Placeholder */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg text-center border-2 border-dashed border-gray-200 dark:border-gray-600 transition-colors duration-300 flex-1 min-h-0">
                    <StockChartWidget />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose Gold Net International?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide cutting-edge trading technology and unparalleled
              support to help you succeed in the markets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border dark:border-gray-700">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-12 lg:w-16 h-12 lg:h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Shield className="h-6 lg:h-8 w-6 lg:w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
                  Secure Trading
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                  Bank-level security with advanced encryption and multi-factor
                  authentication to protect your investments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border dark:border-gray-700">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-12 lg:w-16 h-12 lg:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <BarChart3 className="h-6 lg:h-8 w-6 lg:w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                  Professional-grade charts, technical indicators, and market
                  analysis tools for informed trading decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border dark:border-gray-700">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-12 lg:w-16 h-12 lg:h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Users className="h-6 lg:h-8 w-6 lg:w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
                  Expert Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                  24/7 customer support from trading experts ready to help you
                  navigate the markets successfully.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border dark:border-gray-700">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-12 lg:w-16 h-12 lg:h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Globe className="h-6 lg:h-8 w-6 lg:w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
                  Global Markets
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                  Access to forex, commodities, indices, and cryptocurrencies
                  from markets around the world.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border dark:border-gray-700">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-12 lg:w-16 h-12 lg:h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <TrendingUp className="h-6 lg:h-8 w-6 lg:w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
                  Real-time Data
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                  Lightning-fast execution with real-time market data and
                  instant order processing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border dark:border-gray-700">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-12 lg:w-16 h-12 lg:h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Star className="h-6 lg:h-8 w-6 lg:w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4">
                  Premium Experience
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                  Intuitive platform design with customizable dashboards and
                  advanced trading tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trading Platforms Section */}
      <section className="py-12 lg:py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Trading Platforms
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our range of powerful trading platforms designed for
              every type of trader.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Web Platform
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                      Trade directly from your browser with our advanced
                      web-based platform. No downloads required.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Mobile App
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                      Trade on the go with our mobile apps for iOS and Android.
                      Full functionality in your pocket.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Desktop Application
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                      Professional desktop platform with advanced charting and
                      analysis tools for serious traders.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              >
                Explore Platforms
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    Platform Features
                  </h3>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Live Demo
                  </div>
                </div>

                {/* TradingView Platform Placeholder */}
                <div className="h-[500px] bg-gray-50 dark:bg-gray-600 rounded-lg text-center border-2 border-dashed border-gray-200 dark:border-gray-500 transition-colors duration-300">
                  <PlatformFeatureChartWidget />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 lg:p-4 transition-colors duration-300">
                    <div className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                      100+
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Indicators
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 lg:p-4 transition-colors duration-300">
                    <div className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      50+
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Instruments
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 lg:p-4 transition-colors duration-300">
                    <div className="text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                      24/7
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Trading
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about trading with Gold Net
              International.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300"
              >
                <button
                  onClick={() => handleFaqToggle(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </h3>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  )}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openFaq === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 lg:py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Stay Updated with Market News
                </h2>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300">
                  Subscribe to our newsletter and get the latest trading
                  insights, market analysis, and platform updates delivered to
                  your inbox.
                </p>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 px-6 py-3 whitespace-nowrap"
                  >
                    Subscribe
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20 bg-green-600 dark:bg-green-700 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Start Trading?
            </h2>
            <p className="text-lg lg:text-xl text-green-100 dark:text-green-200">
              Join Gold Net International today and take your trading to the
              next level with our advanced platform and expert support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 lg:h-5 w-4 lg:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 lg:py-16 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-6 bg-green-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-green-400 rounded-sm"></div>
                  <div className="w-2 h-8 bg-green-600 rounded-sm"></div>
                  <div className="w-2 h-3 bg-green-300 rounded-sm"></div>
                </div>
                <span className="text-base lg:text-lg font-bold">
                  Gold Net International
                </span>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm lg:text-base">
                Your trusted partner in global trading with advanced technology
                and expert support.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base lg:text-lg font-semibold">Trading</h3>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors text-sm lg:text-base"
                  >
                    Forex
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors text-sm lg:text-base"
                  >
                    Commodities
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors text-sm lg:text-base"
                  >
                    Indices
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors text-sm lg:text-base"
                  >
                    Cryptocurrencies
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-base lg:text-lg font-semibold">Platforms</h3>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors text-sm lg:text-base"
                  >
                    Web Platform
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors text-sm lg:text-base"
                  >
                    Mobile App
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors text-sm lg:text-base"
                  >
                    Desktop
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors text-sm lg:text-base"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 lg:mt-12 pt-6 lg:pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              © {new Date().getFullYear()} Gold Net International. All rights
              reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white text-sm transition-colors"
              >
                Risk Disclosure
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
