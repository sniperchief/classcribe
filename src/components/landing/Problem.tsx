export default function Problem() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4 sm:mb-6 px-2">
            Everything You Need to Ace Your Exams
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Stop spending hours making study materials. Let Classcribe do the heavy lifting so you can focus on learning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <Feature
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            }
            title="Never Miss a Key Point"
            description="Upload your lecture recordings and get every important concept captured — no more incomplete notes."
          />
          <Feature
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="Flashcards in Seconds"
            description="Create exam-ready flashcards instantly, not hours. Perfect for memorizing key terms and concepts."
          />
          <Feature
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            title="MCQ Practice Questions"
            description="Get instant multiple choice questions with explanations. Practice the way you'll be tested."
          />
          <Feature
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Quiz Yourself"
            description="Test yourself before the exam tests you. True/false quizzes help you identify gaps in your knowledge."
          />
          <Feature
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Smart Summaries"
            description="Get the key points without reading everything. Perfect for quick revision before exams."
          />
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#F8FAFC] rounded-xl p-5 sm:p-6 border border-[#E5E7EB] hover:border-emerald-300 hover:shadow-md transition-all">
      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
