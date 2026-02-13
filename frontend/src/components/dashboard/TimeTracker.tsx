export default function TimeTracker({ value }: { value: string }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,#1f8b55_0%,#0f3f2a_55%,#071d13_100%)] p-5 text-white shadow-md">
      <p className="text-3xl font-medium">Time Tracker</p>
      <p className="mt-4 text-6xl font-semibold tracking-wide">{value}</p>
    </section>
  )
}
