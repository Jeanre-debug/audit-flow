import Link from 'next/link'
import { getTemplates } from '@/actions/templates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, FileText, Layers, ClipboardCheck } from 'lucide-react'

export default async function TemplatesPage() {
  const templates = await getTemplates()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Audit Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage reusable audit templates
          </p>
        </div>
        <Button asChild>
          <Link href="/audits/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No templates yet
            </h3>
            <p className="text-gray-500 text-center mb-4 max-w-md">
              Create your first audit template to start conducting standardized audits
              across your sites.
            </p>
            <Button asChild>
              <Link href="/audits/templates/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Audits</TableHead>
                <TableHead>Pass Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Link
                      href={`/audits/templates/${template.id}`}
                      className="font-medium hover:underline"
                    >
                      {template.name}
                    </Link>
                    {template.description && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {template.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {template.category ? (
                      <Badge variant="outline">{template.category}</Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Layers className="h-4 w-4 text-gray-400" />
                      {template._count.sections}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ClipboardCheck className="h-4 w-4 text-gray-400" />
                      {template._count.audits}
                    </div>
                  </TableCell>
                  <TableCell>{template.passingScore}%</TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/audits/templates/${template.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
