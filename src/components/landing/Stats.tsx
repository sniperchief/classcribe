export default function Stats() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <Stat value="2,000+" label="Active Students" />
          <Stat value="15,000+" label="Lectures Processed" />
          <Stat value="50+" label="Universities" />
          <Stat value="4.8/5" label="Average Rating" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-2">
      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#A855F7] mb-1">{value}</p>
      <p className="text-gray-600 text-xs sm:text-sm">{label}</p>
    </div>
  );
}
