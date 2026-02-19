'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    monthlyPrice: { NGN: 6500, USD: 6 },
    yearlyPrice: { NGN: 65000, USD: 60 },
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

export default function Pricing() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.country_code === 'NG') {
          setCurrency('NGN');
        } else {
          setCurrency('USD');
        }
      } catch {
        setCurrency('USD');
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

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
    <section id="pricing" className="relative overflow-hidden bg-gradient-to-b from-white via-[#F3E8FF] to-white">
      {/* Soft radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.5)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.4)_0%,_transparent_40%)]"></div>

      {/* Main content area */}
      <div className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A]">
              Select Plan
            </h2>
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

                <Link
                  href={plan.name === 'Free' ? '/signup' : '/pricing'}
                  className={`block w-full py-3 rounded-lg text-center font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-[#A855F7] hover:bg-[#9333EA]'
                      : 'bg-[#0F172A] hover:bg-[#1e293b]'
                  }`}
                  style={{ color: '#FFFFFF' }}
                >
                  {plan.buttonText}
                </Link>

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

          {/* Trust indicators */}
          <div className="mt-12 sm:mt-16 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>14-day money back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
