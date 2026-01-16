import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSite, deleteSite } from '@/actions/sites'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Package,
  Plus,
  ArrowLeft,
} from 'lucide-react'
import { DeleteSiteButton } from './delete-button'

interface SitePageProps {
  params: Promise<{ id: string }>
}

export default async function SitePage({ params }: SitePageProps) {
  const { id } = await params
  const site = await getSite(id)

  if (!site) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {site.name}
            </h1>
            <Badge variant={site.isActive ? 'default' : 'secondary'}>
              {site.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {(site.city || site.state) && (
            <p className="text-gray-600 dark:text-gray-400">
              {[site.city, site.state, site.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/sites/${site.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteSiteButton siteId={site.id} siteName={site.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Site Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {site.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {site.address}
                    {site.city && <>, {site.city}</>}
                    {site.state && <>, {site.state}</>}
                    {site.postalCode && <> {site.postalCode}</>}
                    {site.country && <>, {site.country}</>}
                  </p>
                </div>
              </div>
            )}
            {site.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600 dark:text-gray-400">{site.phone}</p>
                </div>
              </div>
            )}
            {site.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600 dark:text-gray-400">{site.email}</p>
                </div>
              </div>
            )}
            {!site.address && !site.phone && !site.email && (
              <p className="text-gray-500 text-center py-4">
                No contact details added yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Audits</span>
              <span className="font-semibold">{site._count.audits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Open Issues</span>
              <span className="font-semibold">{site._count.issues}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Assets</span>
              <span className="font-semibold">{site.assets.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assets</CardTitle>
            <CardDescription>Equipment at this site</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/assets/new?siteId=${site.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {site.assets.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assets at this site yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {site.assets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800 -mx-4 px-4"
                >
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-gray-500">{asset.type}</p>
                  </div>
                  <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                    {asset.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
