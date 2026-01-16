import { notFound } from 'next/navigation'
import { getSite } from '@/actions/sites'
import { SiteForm } from '@/components/forms/site-form'

interface EditSitePageProps {
  params: Promise<{ id: string }>
}

export default async function EditSitePage({ params }: EditSitePageProps) {
  const { id } = await params
  const site = await getSite(id)

  if (!site) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SiteForm site={site} />
    </div>
  )
}
