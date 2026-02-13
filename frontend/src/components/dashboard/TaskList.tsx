import { Circle } from 'lucide-react'
import type { TaskItem } from '../../types/dashboard'

const colorMap: Record<TaskItem['color'], string> = {
  blue: 'text-[#3f65ff]',
  green: 'text-[#2fa86c]',
  yellow: 'text-[#e7b11f]',
  orange: 'text-[#ef8e3b]',
  purple: 'text-[#7a56d6]',
}

export default function TaskList({ tasks }: { tasks: TaskItem[] }) {
  return (
    <section className="rounded-3xl border border-[#e7ece8] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-[#122019]">Project</h3>
        <button className="rounded-full border border-[#8ea998] px-4 py-1.5 text-sm text-[#2a5f42] transition-all duration-200 hover:bg-[#eef5f0]" type="button">
          + New
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <article className="rounded-2xl border border-[#edf2ee] p-3" key={task.id}>
            <div className="flex items-start gap-2">
              <Circle className={colorMap[task.color]} fill="currentColor" size={13} />
              <div>
                <p className="text-base font-medium text-[#1a2721]">{task.title}</p>
                <p className="text-sm text-[#8a9792]">Due date: {task.due}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
