export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-3 sm:mb-4 px-2">
            How to Use Classcribe
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            No complicated setup. Just upload, wait, and study.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <Step
            number={1}
            title="Upload Your Recording"
            description="Record your lecture on your phone or laptop, then upload the audio file. We support MP3, WAV, M4A, and more."
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
          />
          <Step
            number={2}
            title="AI Processes Audio"
            description="Our AI transcribes and analyzes the lecture, identifying key concepts, definitions, and important points."
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <Step
            number={3}
            title="Get Structured Notes"
            description="Receive clean, organized notes with headings, bullet points, and key takeaways — ready to study."
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
