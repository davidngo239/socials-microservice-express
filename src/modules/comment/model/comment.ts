import { z } from 'zod';
import { ErrInvalidContent } from './error';

export enum commentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELETED = 'deleted',
  SPAM = 'spam'
}
export const commentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  postId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  content: z.string().min(1, ErrInvalidContent.message),
  likedCount: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.nativeEnum(commentStatus).default(commentStatus.APPROVED),
  replyCount: z.number().int().nonnegative().default(0)
});

export type Comment = z.infer<typeof commentSchema>;
