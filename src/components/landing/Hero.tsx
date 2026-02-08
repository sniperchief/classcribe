import Link from 'next/link';

export default function Hero() {
  return (
    <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 lg:pt-44 lg:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium mb-6 sm:mb-8">
          <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
          Trusted by 2,000+ students
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-tight max-w-4xl mx-auto mb-4 sm:mb-6 px-2">
          Turn Lecture Recordings Into{' '}
          <span className="text-[#2563EB]">Exam-Ready Notes</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          Stop scrambling to take notes in class. Upload your lecture audio and get clean,
          structured notes you can actually study from.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 px-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-[#2563EB] font-medium text-base px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#1d4ed8] transition-colors text-center"
            style={{ color: '#FFFFFF' }}
          >
            Start Taking Better Notes
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto bg-white font-medium text-base px-6 sm:px-8 py-3 sm:py-4 rounded-lg border border-[#2563EB] hover:bg-blue-50 transition-colors text-center"
            style={{ color: '#2563EB' }}
          >
            See How It Works
          </a>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500 px-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Works with any lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Notes in minutes</span>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-12 sm:mt-16 relative px-2 sm:px-4 overflow-hidden">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl shadow-gray-200/50 border border-[#E5E7EB] p-3 sm:p-6 lg:p-8 max-w-4xl mx-auto relative z-10">
            {/* Mock App Interface */}
            <div className="bg-[#F8FAFC] rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                <span className="text-xs sm:text-sm text-gray-400 ml-2 truncate">Introduction to Psychology - Lecture 3</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-4/6"></div>
                  <div className="h-2.5 sm:h-3 bg-[#2563EB]/20 rounded w-full mt-3 sm:mt-4"></div>
                  <div className="h-2.5 sm:h-3 bg-[#2563EB]/20 rounded w-5/6"></div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-[#E5E7EB]">
                  <p className="text-xs sm:text-sm font-medium text-[#0F172A] mb-2">Key Concepts</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] mt-0.5">•</span>
                      <span>Classical conditioning involves...</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] mt-0.5">•</span>
                      <span>Operant conditioning differs...</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] mt-0.5">•</span>
                      <span>Reinforcement schedules...</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Elements - contained within parent */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full max-w-4xl bg-gradient-to-r from-blue-50 via-transparent to-green-50 rounded-full blur-3xl opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
