import { getSites } from '@/actions/sites'
import { requireOrganization } from '@/actions/auth'
import { prisma } from '@/lib/prisma'
import { IssueForm } from '@/components/forms/issue-form'

export default async function NewIssuePage() {
  const { organization } = await requireOrganization()

  const [sites, members] = await Promise.all([
    getSites(),
    prisma.organizationMember.findMany({
      where: { organizationId: organization.id, isActive: true },
      include: { user: { select: { id: true, name: true } } },
    }),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <IssueForm
        sites={sites.map((s) => ({ id: s.id, name: s.name }))}
        users={members.map((m) => ({ id: m.user.id, name: m.user.name }))}
      />
    </div>
  )
}
