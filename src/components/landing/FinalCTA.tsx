import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#A855F7] via-[#2D6A4F] to-[#1B4332] rounded-2xl sm:rounded-3xl px-5 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 text-center relative overflow-hidden">
          {/* Background Pattern - contained within parent */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-violet-400/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 sm:w-60 h-48 sm:h-60 bg-emerald-400/20 rounded-full translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/2 left-1/2 w-24 sm:w-32 h-24 sm:h-32 bg-emerald-500/15 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
              Ready to Transform Your Study Sessions?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-violet-100 mb-8 sm:mb-10 leading-relaxed px-2">
              Stop struggling with note-taking. Start understanding your lectures.
              Join thousands of students who study smarter with Classcribe.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-base
                         hover:bg-violet-50 transition-colors duration-200 text-center"
                style={{ color: '#A855F7' }}
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-transparent px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-base
                         border-2 border-white/30 hover:border-white/60 transition-colors duration-200 text-center"
                style={{ color: '#FFFFFF' }}
              >
                I Have an Account
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-violet-100">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Free to start
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
