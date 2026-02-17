import GuestUpload from './GuestUpload';

export default function Hero() {
  return (
    <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight max-w-4xl mx-auto mb-4 sm:mb-6 px-2">
          Turn Lecture Recordings Into
          <br />
          <span className="text-[#2563EB]">Exam-Ready Notes</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          Upload your lecture audio and get clean, structured notes you can actually study from.
        </p>

        {/* Upload Section */}
        <div className="relative px-2 sm:px-4">
          <GuestUpload />
          {/* Decorative Elements */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full max-w-4xl bg-gradient-to-r from-blue-50 via-transparent to-green-50 rounded-full blur-3xl opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
