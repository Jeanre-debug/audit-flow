import { getSites } from '@/actions/sites'
import { AssetForm } from '@/components/forms/asset-form'

export default async function NewAssetPage() {
  const sites = await getSites()

  return (
    <div className="max-w-2xl mx-auto">
      <AssetForm sites={sites.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  )
}
