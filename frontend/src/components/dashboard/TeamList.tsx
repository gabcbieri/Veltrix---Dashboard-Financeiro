import type { TeamMember } from '../../types/dashboard'

const statusClass: Record<TeamMember['status'], string> = {
  Completed: 'bg-[#e4f6ea] text-[#2e905c]',
  'In Progress': 'bg-[#fef6dd] text-[#d6a000]',
  Pending: 'bg-[#ffe9e9] text-[#d95a5a]',
}

export default function TeamList({ members }: { members: TeamMember[] }) {
  return (
    <section className="rounded-3xl border border-[#e7ece8] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-[#122019]">Team Collaboration</h3>
        <button className="rounded-full border border-[#8ea998] px-4 py-1.5 text-sm text-[#2a5f42] transition-all duration-200 hover:bg-[#eef5f0]" type="button">
          + Add Member
        </button>
      </div>
      <div className="space-y-3">
        {members.map((member) => (
          <article className="flex items-start justify-between gap-3 rounded-2xl border border-[#edf2ee] p-3" key={member.id}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d4e8dc] text-sm font-semibold text-[#1e5d40]">
                {member.avatar}
              </span>
              <div>
                <p className="text-base font-medium text-[#182720]">{member.name}</p>
                <p className="text-sm text-[#8a9792]">{member.role}</p>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs ${statusClass[member.status]}`}>{member.status}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
