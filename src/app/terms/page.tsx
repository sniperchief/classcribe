'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <nav className="bg-white border-b border-[#E5E7EB]">
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
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 sm:p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">1. Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Classcribe at classcribe.app, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Classcribe is an AI-powered service that converts lecture recordings into structured study notes.
              Users can upload audio files, which are transcribed and processed to generate comprehensive notes,
              summaries, and study materials.
            </p>
          </section>

          {/* Account Terms */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">3. Account Terms</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account and password.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
              <li>You must be at least 13 years old to use this service.</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">4. Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Upload content that infringes on intellectual property rights of others</li>
              <li>Upload harmful, offensive, or illegal content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for any unlawful purpose</li>
              <li>Resell or redistribute the service without permission</li>
              <li>Use automated systems to access the service without our consent</li>
            </ul>
          </section>

          {/* Subscription and Payments */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">5. Subscription and Payments</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Free accounts are limited to 2 lecture uploads per month.</li>
              <li>Paid subscriptions provide additional features and higher upload limits.</li>
              <li>Subscription fees are billed in advance on a monthly or yearly basis.</li>
              <li>All fees are non-refundable except as described in our Refund Policy.</li>
              <li>We reserve the right to change our pricing with 30 days notice.</li>
            </ul>
          </section>

          {/* Content Ownership */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">6. Content Ownership</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>Your Content:</strong> You retain ownership of all audio recordings and content you upload.
              By uploading content, you grant us a limited license to process it for the purpose of providing our services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Generated Notes:</strong> The notes generated from your recordings are yours to use for personal
              and educational purposes.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">7. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Classcribe service, including its original content, features, and functionality, is owned by
              Classcribe and is protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">8. Service Availability</h2>
            <p className="text-gray-600 leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted access to the service.
              We may modify, suspend, or discontinue any part of the service at any time without prior notice.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">9. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, Classcribe shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including loss of profits, data, or other intangible losses
              resulting from your use of the service.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">10. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed">
              The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              either express or implied. We do not guarantee the accuracy of transcriptions or generated notes.
              You should review all generated content before relying on it for academic purposes.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">11. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your account at any time for violations of these terms.
              You may cancel your account at any time. Upon termination, your right to use the service will
              immediately cease.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">12. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant changes
              by posting on our website. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">13. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with applicable laws,
              without regard to conflict of law principles.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">14. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:support@classcribe.app" className="text-[#A855F7] hover:underline">
                support@classcribe.app
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Classcribe. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-[#0F172A]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-[#A855F7] font-medium">
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
