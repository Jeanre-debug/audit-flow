import Link from 'next/link'
import { getSites } from '@/actions/sites'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, Package, ClipboardCheck, AlertTriangle } from 'lucide-react'

export default async function SitesPage() {
  const sites = await getSites()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sites</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your locations and facilities
          </p>
        </div>
        <Button asChild>
          <Link href="/sites/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Link>
        </Button>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No sites yet
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Add your first site to start conducting audits and tracking compliance.
            </p>
            <Button asChild>
              <Link href="/sites/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Site
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <Link key={site.id} href={`/sites/${site.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                    <Badge variant={site.isActive ? 'default' : 'secondary'}>
                      {site.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {(site.city || site.state) && (
                    <CardDescription>
                      {[site.city, site.state].filter(Boolean).join(', ')}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{site._count.assets} assets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClipboardCheck className="h-4 w-4" />
                      <span>{site._count.audits} audits</span>
                    </div>
                    {site._count.issues > 0 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{site._count.issues} issues</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
