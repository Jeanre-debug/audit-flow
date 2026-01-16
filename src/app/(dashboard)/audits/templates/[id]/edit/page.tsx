import { notFound } from 'next/navigation'
import { getTemplate } from '@/actions/templates'
import { TemplateBuilder } from '@/components/audit/template-builder'

interface EditTemplatePageProps {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Template: {template.name}
      </h1>
      <TemplateBuilder template={template} />
    </div>
  )
}
