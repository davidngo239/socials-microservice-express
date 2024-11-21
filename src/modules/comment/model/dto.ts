import { z } from 'zod'
import { ErrInvalidContent } from './error'
import { Comment } from './comment'

// Create DTO
export const commentCreateDTOSchema = z.object({
 userId: z.string().uuid(),
 postId: z.string().uuid(),
 parentId: z.string().uuid().nullable().optional(),
 content: z.string().min(1, ErrInvalidContent.message)
})
export type CommentCreateDTO = z.infer<typeof commentCreateDTOSchema>

// Update DTO
export const commentUpdateDTOSchema = z.object({
 content: z.string().min(1, ErrInvalidContent.message).optional()
})
export type CommentUpdateDTO = z.infer<typeof commentUpdateDTOSchema>

// Condition DTO
export const commentCondDTOSchema = z.object({
 postId: z.string().uuid(),
 parentId: z.string().uuid().optional(),
})
export type CommentCondDTO = z.infer<typeof commentCondDTOSchema>


