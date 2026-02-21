'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Currency = 'NGN' | 'USD';

type PricingPlan = {
  name: string;
  description: string;
  monthlyPrice: { NGN: number; USD: number };
  yearlyPrice: { NGN: number; USD: number };
  features: string[];
  highlighted?: boolean;
  buttonText: string;
};

const plans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'Best for first time users',
    monthlyPrice: { NGN: 0, USD: 0 },
    yearlyPrice: { NGN: 0, USD: 0 },
    features: [
      'Up to 20-30 mins per lecture',
      '2 lectures per month',
      'AI-generated notes',
      'Full transcript access',
      'Basic formatting',
      'In-app note viewer',
    ],
    buttonText: 'Get Started',
  },
  {
    name: 'Student',
    description: 'Best for regular student',
    monthlyPrice: { NGN: 6500, USD: 9.99 },
    yearlyPrice: { NGN: 65000, USD: 99.99 },
    features: [
      'Up to 60 mins per lecture',
      '10-15 lectures per month',
      '15 likely exam questions per lecture',
      'AI-generated notes',
      'Full transcript access',
      'PDF export',
      'Priority processing',
      'Advanced formatting',
      'Clean exam ready notes',
    ],
    highlighted: true,
    buttonText: 'Upgrade Now',
  },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Detect user's location for currency
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.country_code === 'NG') {
          setCurrency('NGN');
        } else {
          setCurrency('USD');
        }
      } catch (error) {
        // Default to USD if detection fails
        setCurrency('USD');
      } finally {
        setLoading(false);
      }
    };

    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/subscription');
        if (response.ok) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    detectLocation();
    checkAuth();
  }, []);

  const handleCheckout = async (planName: string) => {
    if (planName === 'Free') {
      router.push('/signup');
      return;
    }

    // If not logged in, redirect to signup first
    if (!isLoggedIn) {
      router.push('/signup?redirect=pricing');
      return;
    }

    setCheckingOut(true);

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'student',
          billingCycle: isYearly ? 'yearly' : 'monthly',
          currency,
        }),
      });

      const data = await response.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const formatPrice = (price: number, curr: Currency) => {
    if (price === 0) return 'Free';

    if (curr === 'NGN') {
      return `₦${price.toLocaleString()}`;
    }
    return `$${price}`;
  };

  const getPrice = (plan: PricingPlan) => {
    if (isYearly) {
      return plan.yearlyPrice[currency];
    }
    return plan.monthlyPrice[currency];
  };

  const getPeriod = () => {
    return isYearly ? '/year' : '/month';
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <nav className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#A855F7] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-[#0F172A]">Classcribe</span>
            </Link>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="bg-[#A855F7] text-sm font-medium py-2 px-4 rounded-lg hover:bg-[#9333EA] transition-colors"
                  style={{ color: '#FFFFFF' }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-600 hover:text-[#0F172A]">
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[#A855F7] text-sm font-medium py-2 px-4 rounded-lg hover:bg-[#9333EA] transition-colors"
                    style={{ color: '#FFFFFF' }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A]">
            Select Plan
          </h1>
        </div>

        {/* Billing Toggle */}
        <div className="flex flex-col items-center mb-10">
          <div className="inline-flex rounded-lg overflow-hidden border border-[#0F172A]">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                !isYearly
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white text-[#0F172A] hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                isYearly
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white text-[#0F172A] hover:bg-gray-50'
              }`}
            >
              Yearly
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">Cancel anytime</p>
          {isYearly && (
            <span className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              2 months free
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-6 sm:p-8 border-2 transition-shadow hover:shadow-lg ${
                plan.highlighted
                  ? 'border-[#A855F7] shadow-lg relative'
                  : 'border-[#E5E7EB]'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#A855F7] text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#0F172A]">
                    {loading ? '...' : formatPrice(getPrice(plan), currency)}
                  </span>
                  {getPrice(plan) > 0 && (
                    <span className="text-gray-500">{getPeriod()}</span>
                  )}
                </div>
                {isYearly && getPrice(plan) > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    2 months free (pay for 10)
                  </p>
                )}
              </div>

              <button
                onClick={() => handleCheckout(plan.name)}
                disabled={checkingOut}
                className={`block w-full py-3 rounded-lg text-center font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-[#A855F7] hover:bg-[#9333EA]'
                    : 'bg-[#0F172A] hover:bg-[#1e293b]'
                } ${checkingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ color: '#FFFFFF' }}
              >
                {checkingOut && plan.highlighted ? 'Processing...' : plan.buttonText}
              </button>

              <div className="mt-8">
                <p className="text-sm font-medium text-[#0F172A] mb-4">What&apos;s included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.highlighted ? 'text-[#A855F7]' : 'text-green-500'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: 'What happens when I reach my monthly limit?',
                answer: "You'll see a message prompting you to upgrade. Your existing notes remain accessible, but you won't be able to process new lectures until your limit resets next month or you upgrade.",
              },
              {
                question: 'Can I cancel my subscription anytime?',
                answer: "Yes! You can cancel anytime. You'll continue to have access to your plan features until the end of your billing period.",
              },
              {
                question: 'Do unused lectures roll over to the next month?',
                answer: "No, unused lectures don't roll over. Your lecture count resets at the beginning of each billing cycle.",
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit/debit cards, bank transfers, and USSD payments through Paystack.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="font-semibold text-[#0F172A] pr-4">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-4">
            Ready to transform your study sessions?
          </h2>
          <p className="text-gray-600 mb-6">
            {isLoggedIn ? 'Upgrade your plan to unlock more features.' : 'Start for free. No credit card required.'}
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="inline-block bg-[#A855F7] px-8 py-3 rounded-lg font-medium hover:bg-[#9333EA] transition-colors"
            style={{ color: '#FFFFFF' }}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Classcribe. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-500 hover:text-[#0F172A]">
                Home
              </Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#0F172A]">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-500 hover:text-[#0F172A]">
                    Log In
                  </Link>
                  <Link href="/signup" className="text-sm text-gray-500 hover:text-[#0F172A]">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
