export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-3 sm:mb-4 px-2">
            From Lecture to Exam-Ready in Minutes
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Three simple steps to transform any study material into your secret weapon for exams.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <Step
            number={1}
            title="Upload Anything"
            description="Drop in your lecture recording, PDF, slides, Word doc, or even photos of your notes. We handle it all."
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
          />
          <Step
            number={2}
            title="Get Exam-Ready Materials"
            description="Instantly receive flashcards, MCQs, quizzes, and summaries — everything you need to prepare for your exams."
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <Step
            number={3}
            title="Study & Ace It"
            description="Practice with your personalized study materials and walk into every exam feeling confident and prepared."
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative text-center">
      {/* Step Number */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A855F7]/10 rounded-2xl text-[#A855F7] mb-5 sm:mb-6">
        {icon}
      </div>

      {/* Number Badge */}
      <div className="absolute top-0 left-1/2 translate-x-6 -translate-y-1 w-6 h-6 bg-[#A855F7] text-white text-xs font-bold rounded-full flex items-center justify-center">
        {number}
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-2 sm:mb-3">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{description}</p>
    </div>
  );
}
