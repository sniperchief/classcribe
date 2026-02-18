import GuestUpload from './GuestUpload';

function MicrophoneIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

// Generate microphone icon configurations
const microphoneIcons = [
  // Top row
  { top: '2%', left: '3%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-300', opacity: 'opacity-40', rotate: '-15deg' },
  { top: '5%', left: '12%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-400', opacity: 'opacity-35', rotate: '20deg' },
  { top: '3%', left: '22%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-fuchsia-300', opacity: 'opacity-45', rotate: '-8deg' },
  { top: '6%', left: '35%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-400', opacity: 'opacity-30', rotate: '25deg' },
  { top: '4%', left: '48%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-300', opacity: 'opacity-50', rotate: '-12deg' },
  { top: '5%', left: '62%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-violet-300', opacity: 'opacity-35', rotate: '18deg' },
  { top: '3%', left: '75%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-fuchsia-400', opacity: 'opacity-40', rotate: '-22deg' },
  { top: '6%', left: '88%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-300', opacity: 'opacity-45', rotate: '10deg' },
  { top: '2%', left: '95%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-400', opacity: 'opacity-30', rotate: '-5deg' },

  // Second row
  { top: '15%', left: '5%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-purple-400', opacity: 'opacity-45', rotate: '30deg' },
  { top: '18%', left: '18%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-300', opacity: 'opacity-35', rotate: '-18deg' },
  { top: '14%', left: '82%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-fuchsia-300', opacity: 'opacity-40', rotate: '15deg' },
  { top: '17%', left: '92%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-purple-300', opacity: 'opacity-50', rotate: '-25deg' },

  // Third row
  { top: '28%', left: '2%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-400', opacity: 'opacity-40', rotate: '-10deg' },
  { top: '25%', left: '10%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-fuchsia-400', opacity: 'opacity-35', rotate: '22deg' },
  { top: '30%', left: '88%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-violet-300', opacity: 'opacity-45', rotate: '-20deg' },
  { top: '26%', left: '96%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-purple-400', opacity: 'opacity-30', rotate: '8deg' },

  // Middle section - left side
  { top: '40%', left: '1%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-purple-300', opacity: 'opacity-50', rotate: '25deg' },
  { top: '45%', left: '8%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-400', opacity: 'opacity-35', rotate: '-15deg' },
  { top: '50%', left: '3%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-fuchsia-300', opacity: 'opacity-45', rotate: '12deg' },
  { top: '55%', left: '10%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-purple-400', opacity: 'opacity-40', rotate: '-28deg' },

  // Middle section - right side
  { top: '42%', left: '90%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-300', opacity: 'opacity-45', rotate: '18deg' },
  { top: '48%', left: '95%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-purple-300', opacity: 'opacity-35', rotate: '-22deg' },
  { top: '52%', left: '88%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-fuchsia-400', opacity: 'opacity-50', rotate: '5deg' },
  { top: '58%', left: '93%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-400', opacity: 'opacity-40', rotate: '-12deg' },

  // Lower section
  { top: '65%', left: '4%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-fuchsia-300', opacity: 'opacity-35', rotate: '20deg' },
  { top: '68%', left: '12%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-violet-300', opacity: 'opacity-45', rotate: '-8deg' },
  { top: '70%', left: '86%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-purple-400', opacity: 'opacity-40', rotate: '15deg' },
  { top: '66%', left: '94%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-violet-400', opacity: 'opacity-50', rotate: '-25deg' },

  // Bottom section
  { top: '78%', left: '2%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-300', opacity: 'opacity-45', rotate: '10deg' },
  { top: '82%', left: '8%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-violet-400', opacity: 'opacity-35', rotate: '-18deg' },
  { top: '85%', left: '18%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-fuchsia-400', opacity: 'opacity-40', rotate: '22deg' },
  { top: '80%', left: '30%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-300', opacity: 'opacity-30', rotate: '-5deg' },
  { top: '88%', left: '42%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-300', opacity: 'opacity-45', rotate: '28deg' },
  { top: '83%', left: '55%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-fuchsia-300', opacity: 'opacity-35', rotate: '-15deg' },
  { top: '86%', left: '68%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-400', opacity: 'opacity-50', rotate: '12deg' },
  { top: '80%', left: '78%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-400', opacity: 'opacity-40', rotate: '-22deg' },
  { top: '84%', left: '88%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-fuchsia-400', opacity: 'opacity-35', rotate: '8deg' },
  { top: '82%', left: '96%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-300', opacity: 'opacity-45', rotate: '-10deg' },

  // Extra scattered icons
  { top: '92%', left: '5%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-300', opacity: 'opacity-40', rotate: '15deg' },
  { top: '95%', left: '15%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-400', opacity: 'opacity-35', rotate: '-20deg' },
  { top: '90%', left: '25%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-fuchsia-300', opacity: 'opacity-45', rotate: '5deg' },
  { top: '94%', left: '38%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-violet-400', opacity: 'opacity-30', rotate: '-12deg' },
  { top: '92%', left: '52%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-300', opacity: 'opacity-50', rotate: '25deg' },
  { top: '96%', left: '65%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-fuchsia-400', opacity: 'opacity-35', rotate: '-8deg' },
  { top: '91%', left: '75%', size: 'w-5 h-5 sm:w-6 sm:h-6', color: 'text-violet-300', opacity: 'opacity-45', rotate: '18deg' },
  { top: '95%', left: '85%', size: 'w-3 h-3 sm:w-4 sm:h-4', color: 'text-purple-400', opacity: 'opacity-40', rotate: '-25deg' },
  { top: '93%', left: '95%', size: 'w-4 h-4 sm:w-5 sm:h-5', color: 'text-fuchsia-300', opacity: 'opacity-35', rotate: '10deg' },
];

export default function Hero() {
  return (
    <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[600px]">
      {/* Violet gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.3)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(192,132,252,0.25)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(167,139,250,0.15)_0%,_transparent_70%)]"></div>

      {/* Microphone icons scattered across the entire hero section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {microphoneIcons.map((icon, index) => (
          <MicrophoneIcon
            key={index}
            className={`absolute ${icon.size} ${icon.color} ${icon.opacity}`}
            style={{
              top: icon.top,
              left: icon.left,
              transform: `rotate(${icon.rotate})`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight max-w-4xl mx-auto mb-4 sm:mb-6 px-2">
          Turn Lecture Recordings Into
          <br />
          <span className="text-[#A855F7]">Exam-Ready Notes</span>
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
            <div className="w-full h-full max-w-4xl bg-gradient-to-r from-violet-50 via-transparent to-green-50 rounded-full blur-3xl opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
