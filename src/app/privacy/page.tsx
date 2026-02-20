'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-[#0F172A]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Introduction */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Introduction</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              Welcome to Classcribe. We are committed to protecting your personal information and your right to privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
              service at classcribe.app.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Information We Collect</h3>
            <p className="text-gray-600 leading-relaxed text-justify mb-4">We collect information that you provide directly to us:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, full name, country, university, and course of study when you create an account.</li>
              <li><strong>Audio Content:</strong> Lecture recordings that you upload for transcription and note generation.</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through our payment provider, Paystack. We do not store your full payment card details.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our service, including features used and time spent.</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">How We Use Your Information</h3>
            <p className="text-gray-600 leading-relaxed text-justify mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your lecture recordings and generate notes</li>
              <li>Process payments and manage your subscription</li>
              <li>Send you service-related communications</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Monitor and analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Third-Party Services</h3>
            <p className="text-gray-600 leading-relaxed text-justify mb-4">We use trusted third-party services to operate our platform, including:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Secure cloud infrastructure for data storage and authentication</li>
              <li>Audio transcription services</li>
              <li>AI services for generating structured notes</li>
              <li>Payment processing services</li>
            </ul>
            <p className="text-gray-600 leading-relaxed text-justify mt-4">
              These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
            </p>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Data Storage and Security</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              We implement appropriate technical and organizational security measures to protect your personal information.
              Your data is stored securely using industry-standard encryption. However, no method of transmission over the
              Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Data Retention</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              We retain your personal information for as long as your account is active or as needed to provide you services.
              You may request deletion of your account and associated data at any time by contacting us at support@classcribe.app.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Your Rights</h3>
            <p className="text-gray-600 leading-relaxed text-justify mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request portability of your data</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Cookies</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              We use essential cookies to maintain your session and remember your preferences.
              These cookies are necessary for the service to function properly.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Children&apos;s Privacy</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Changes to This Policy</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h3 className="text-lg font-semibold text-[#A855F7]/70 mb-3">Contact Us</h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:support@classcribe.app" className="text-[#A855F7] hover:underline">
                support@classcribe.app
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Classcribe. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-[#A855F7] font-medium">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-[#0F172A]">
                Terms of Service
              </Link>
              <Link href="/refund" className="text-sm text-gray-500 hover:text-[#0F172A]">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
