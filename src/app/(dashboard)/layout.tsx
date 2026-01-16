import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { requireOrganization } from '@/actions/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session
  try {
    session = await requireOrganization()
  } catch {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar organizationName={session.organization.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{
            name: session.user.name,
            email: session.user.email,
            avatarUrl: session.user.avatarUrl,
          }}
          organization={{
            name: session.organization.name,
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
