'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, X, Upload, Loader2, ImageIcon } from 'lucide-react'
import { uploadIssueMedia, deleteIssueMedia } from '@/actions/issues'

interface IssueMedia {
  id: string
  url: string
  filename: string | null
  caption: string | null
  stage: string
  createdAt: Date
}

interface ImageUploadProps {
  issueId: string
  media: IssueMedia[]
  stage?: 'initial' | 'resolution' | 'verification'
}

export function ImageUpload({ issueId, media, stage = 'initial' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setError('Please select image files only')
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          setError('Image must be less than 10MB')
          continue
        }

        // Convert to base64
        const base64 = await fileToBase64(file)

        const result = await uploadIssueMedia(issueId, {
          base64,
          filename: file.name,
          mimeType: file.type,
          stage,
        })

        if (!result.success) {
          setError(result.error || 'Failed to upload image')
        }
      }
    } catch (err) {
      setError('Failed to upload image')
      console.error(err)
    } finally {
      setUploading(false)
      // Reset inputs
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const handleDelete = async (mediaId: string) => {
    setDeleting(mediaId)
    try {
      const result = await deleteIssueMedia(issueId, mediaId)
      if (!result.success) {
        setError(result.error || 'Failed to delete image')
      }
    } catch (err) {
      setError('Failed to delete image')
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const stageMedia = media.filter((m) => m.stage === stage)

  return (
    <div className="space-y-4">
      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 sm:flex-none"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          <span className="sm:inline">Take Photo</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 sm:flex-none"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          <span className="sm:inline">Upload</span>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Image gallery */}
      {stageMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {stageMedia.map((item) => (
            <Card key={item.id} className="relative group overflow-hidden aspect-square">
              <Image
                src={item.url}
                alt={item.caption || 'Issue evidence'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100"
                aria-label="Delete image"
              >
                {deleting === item.id ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </button>
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                  {item.caption}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center text-gray-500">
          <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No images attached</p>
          <p className="text-xs mt-1">Take a photo or upload evidence</p>
        </div>
      )}
    </div>
  )
}
