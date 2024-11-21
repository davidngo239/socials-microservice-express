import { z } from 'zod';

export const cmtLikeSchema = z.object({
  userId: z.string().uuid(),
  commentId: z.string().uuid(),
  createdAt: z.date().default(new Date()),
})

export type CommentLike = z.infer<typeof cmtLikeSchema>

export const actionDTOSchema = z.object({
  userId: z.string().uuid(),
  commentId: z.string().uuid(),
})

export type ActionDTO = z.infer<typeof actionDTOSchema>
