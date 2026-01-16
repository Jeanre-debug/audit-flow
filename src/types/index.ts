// Role types
export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'

export type AuditStatus = 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'archived'

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'verified' | 'closed'

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical'

export type IssueType = 'non_conformance' | 'observation' | 'recommendation'

export type QuestionType = 'yes_no' | 'pass_fail' | 'numeric' | 'text' | 'photo' | 'multi_choice' | 'rating'

export type AssetStatus = 'active' | 'maintenance' | 'retired'

export type LogFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly'

// Session types
export interface SessionUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface SessionOrganization {
  id: string
  name: string
  slug: string
  role: UserRole
}

export interface Session {
  user: SessionUser
  organization: SessionOrganization | null
}

// Dashboard stats
export interface DashboardStats {
  openIssues: number
  overdueIssues: number
  auditsThisMonth: number
  averageScore: number
  upcomingAudits: number
  completedAudits: number
}

// Form data types
export interface SiteFormData {
  name: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
}

export interface AssetFormData {
  name: string
  type: string
  siteId?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  purchaseDate?: Date
  warrantyExpiry?: Date
  minTemp?: number
  maxTemp?: number
  notes?: string
}

export interface IssueFormData {
  title: string
  description?: string
  type: IssueType
  priority: IssuePriority
  siteId?: string
  assignedToId?: string
  dueDate?: Date
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Audit template builder types
export interface TemplateQuestionConfig {
  options?: string[]
  min?: number
  max?: number
  unit?: string
  step?: number
}

export interface TemplateQuestionDraft {
  id?: string
  text: string
  description?: string
  type: QuestionType
  isRequired: boolean
  isCritical: boolean
  order: number
  weight: number
  config?: TemplateQuestionConfig
  minValue?: number
  maxValue?: number
  targetValue?: number
  unit?: string
  options?: string[]
}

export interface TemplateSectionDraft {
  id?: string
  title: string
  description?: string
  order: number
  weight: number
  questions: TemplateQuestionDraft[]
}

export interface AuditTemplateDraft {
  name: string
  description?: string
  category?: string
  passingScore: number
  sections: TemplateSectionDraft[]
}

// Log template field definition
export interface LogFieldDefinition {
  name: string
  label: string
  type: 'number' | 'text' | 'select' | 'checkbox' | 'time'
  required: boolean
  assetId?: string
  options?: string[]
  minValue?: number
  maxValue?: number
  unit?: string
}

// Notification types
export type NotificationType =
  | 'audit_due'
  | 'audit_completed'
  | 'issue_assigned'
  | 'issue_escalated'
  | 'issue_due_soon'
  | 'issue_overdue'
  | 'comment_added'
  | 'invitation'
