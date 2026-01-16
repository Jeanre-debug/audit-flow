import Link from 'next/link'
import { getLogTemplates } from '@/actions/logs'
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
import { Plus, FileText } from 'lucide-react'

export default async function LogTemplatesPage() {
  const templates = await getLogTemplates()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Log Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure templates for daily logging
          </p>
        </div>
        <Button asChild>
          <Link href="/logs/templates/new">
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
              No log templates yet
            </h3>
            <p className="text-gray-500 text-center mb-4 max-w-md">
              Create templates for temperature logs, cleaning checklists, and other
              daily records.
            </p>
            <Button asChild>
              <Link href="/logs/templates/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
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
                <TableHead>Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => {
                const fields = template.fields as unknown as { name: string }[]
                return (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="capitalize">{template.type}</TableCell>
                    <TableCell className="capitalize">{template.frequency}</TableCell>
                    <TableCell>{fields?.length || 0} fields</TableCell>
                    <TableCell>{template._count.entries}</TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
