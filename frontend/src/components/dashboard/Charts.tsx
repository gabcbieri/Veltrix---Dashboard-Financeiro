import type { AnalyticsBar, ProgressInfo, Reminder } from '../../types/dashboard'

type ChartsProps = {
  analytics: AnalyticsBar[]
  reminder: Reminder
  progress: ProgressInfo
}

export default function Charts({ analytics, reminder, progress }: ChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.45fr,1fr,1fr]">
      <section className="rounded-3xl border border-[#e7ece8] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold text-[#122019]">Project Analytics</h3>
        <div className="flex h-56 items-end justify-between gap-3">
          {analytics.map((bar) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={bar.label}>
              <div
                className={`w-full rounded-full ${
                  bar.striped
                    ? 'bg-[repeating-linear-gradient(135deg,#d6ddd9_0_6px,#f5f8f6_6px_12px)]'
                    : bar.accent
                      ? 'bg-[#5aba89]'
                      : 'bg-[#166c3f]'
                }`}
                style={{ height: `${bar.value}%` }}
              />
              <span className="text-sm text-[#7f8c86]">{bar.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e7ece8] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold text-[#122019]">Reminders</h3>
        <p className="text-[2rem] font-semibold leading-tight text-[#1f4c38]">{reminder.title}</p>
        <p className="mt-2 text-base text-[#8d9994]">Time : {reminder.time}</p>
        <button className="mt-6 rounded-full bg-[#1e8d57] px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-[#167446]" type="button">
          {reminder.cta}
        </button>
      </section>

      <section className="rounded-3xl border border-[#e7ece8] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold text-[#122019]">Project Progress</h3>
        <div className="relative mx-auto mt-4 h-44 w-44">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#1b8751 ${progress.percent}%, #d8dfdb ${progress.percent}% 100%)`,
            }}
          />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white text-6xl font-semibold text-[#15241d]">
            {progress.percent}%
          </div>
        </div>
        <p className="mt-3 text-center text-sm text-[#7e8c85]">{progress.label}</p>
      </section>
    </div>
  )
}
