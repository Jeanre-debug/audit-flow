import { TemplateBuilder } from '@/components/audit/template-builder'

export default function NewTemplatePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Create Audit Template
      </h1>
      <TemplateBuilder />
    </div>
  )
}
