import { notFound } from 'next/navigation'
import { getAsset } from '@/actions/assets'
import { getSites } from '@/actions/sites'
import { AssetForm } from '@/components/forms/asset-form'

interface EditAssetPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const { id } = await params
  const [asset, sites] = await Promise.all([getAsset(id), getSites()])

  if (!asset) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <AssetForm
        asset={asset}
        sites={sites.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  )
}
