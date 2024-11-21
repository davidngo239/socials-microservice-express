import { z } from 'zod';

export const postLikeSchema = z.object({
  userId: z.string().uuid(),
  postId: z.string().uuid(),
  createdAt: z.date().default(new Date()),
})

export type PostLike = z.infer<typeof postLikeSchema>

export const actionDTOSchema = z.object({
  userId: z.string().uuid(),
  postId: z.string().uuid(),
})

export type ActionDTO = z.infer<typeof actionDTOSchema>
