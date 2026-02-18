const testimonials = [
  {
    quote: "I used to spend hours rewriting my messy notes. Now I just upload the recording and get perfect notes. My grades have actually improved.",
    name: "Amara K.",
    role: "Medical Student",
    university: "University of Lagos",
  },
  {
    quote: "The noise cancellation is incredible. My lecture hall has construction next door and Classcribe still captures everything clearly.",
    name: "David M.",
    role: "Engineering Student",
    university: "University of Nairobi",
  },
  {
    quote: "As an international student, I sometimes miss words because of different accents. Classcribe catches everything I miss.",
    name: "Priya S.",
    role: "Business Student",
    university: "University of Cape Town",
  },
  {
    quote: "I have ADHD and taking notes while listening is really hard for me. This tool has been a game-changer for my learning.",
    name: "James O.",
    role: "Psychology Student",
    university: "Covenant University",
  },
  {
    quote: "The structured format with key takeaways is perfect for exam prep. I can review a 2-hour lecture in 15 minutes.",
    name: "Fatima A.",
    role: "Law Student",
    university: "University of Ghana",
  },
  {
    quote: "Finally, a tool that actually understands academic content. The notes use the right terminology for my biochemistry course.",
    name: "Chen W.",
    role: "Science Student",
    university: "Stellenbosch University",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-gradient-to-b from-white via-[#7EBD8E] to-white">
      {/* Soft radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(100,170,120,0.4)_0%,_transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.4)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.3)_0%,_transparent_40%)]"></div>

      {/* Main content area */}
      <div className="py-20 sm:py-28 lg:py-32 relative">
        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3D4A38] mb-3 sm:mb-4 px-2">
              What Our Users Say
            </h2>
            <p className="text-base sm:text-lg text-[#5A6654] max-w-2xl mx-auto px-2">
              Join thousands of students who are studying smarter, not harder.
            </p>
          </div>
        </div>

        {/* Scrolling Testimonials Marquee */}
        <div className="relative">
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {/* First row - scrolling left */}
          <div className="flex overflow-hidden mb-5 sm:mb-6">
            <div
              className="flex gap-5 sm:gap-6"
              style={{
                animation: 'marquee 30s linear infinite',
              }}
            >
              {testimonials.map((testimonial, index) => (
                <Testimonial key={index} {...testimonial} />
              ))}
              {/* Duplicate for seamless loop */}
              {testimonials.map((testimonial, index) => (
                <Testimonial key={`dup-${index}`} {...testimonial} />
              ))}
            </div>
          </div>

          {/* Second row - scrolling right */}
          <div className="flex overflow-hidden">
            <div
              className="flex gap-5 sm:gap-6"
              style={{
                animation: 'marquee-reverse 30s linear infinite',
              }}
            >
              {[...testimonials].reverse().map((testimonial, index) => (
                <Testimonial key={index} {...testimonial} />
              ))}
              {/* Duplicate for seamless loop */}
              {[...testimonials].reverse().map((testimonial, index) => (
                <Testimonial key={`dup-${index}`} {...testimonial} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonial({
  quote,
  name,
  role,
  university,
}: {
  quote: string;
  name: string;
  role: string;
  university: string;
}) {
  return (
    <div className="flex-shrink-0 w-[300px] sm:w-[350px] bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-shadow duration-200">
      {/* Author - Now at top */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-[#A855F7]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-[#A855F7] font-semibold text-sm">
            {name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-[#0F172A] text-sm truncate">{name}</p>
          <p className="text-gray-500 text-xs truncate">{role}, {university}</p>
        </div>
      </div>

      {/* Stars - Under name */}
      <div className="flex gap-1 mb-3 sm:mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-gray-600 text-sm sm:text-base leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
    </div>
  );
}

