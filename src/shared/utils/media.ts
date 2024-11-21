import { z } from 'zod'

export enum MediaStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
export const MediaModelSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  creatorId: z.string().uuid(),
  fileName: z.string(),
  size: z.number(),
  metadata: z
    .object({
      Alt: z.string()
    })
    .optional(),
  storageProvider: z.string(),
  extension: z.string(),
  status: z.nativeEnum(MediaStatus)
})

export type MediaModel = z.infer<typeof MediaModelSchema>
