import { PublicUser } from '@shared/model';
import { z } from 'zod';
import { ErrMinContent, ErrURLInvalid } from './error';
import { Topic } from './topic';

export enum Type {
  TEXT = 'text',
  MEDIA = 'media',
}
export const postSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, { message: ErrMinContent(1).message }),
  image: z.string().url({ message: ErrURLInvalid.message }).optional(),
  authorId: z.string().uuid(),
  topicId: z.string().uuid(),
  isFeatured: z.boolean().optional().default(false),
  commentCount: z.number().int().nonnegative().default(0),
  likedCount: z.number().int().nonnegative().default(0),
  type: z.nativeEnum(Type),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type Post = z.infer<typeof postSchema> & { topic?: Topic; author?: PublicUser; hasLiked?: boolean; hasSaved?: boolean; };

export const postCondDTOSchema = z.object({
  str: z.string().optional(),
  userId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  isFeatured: z.preprocess(v => v === 'true', z.boolean()).optional(),
  type: z.nativeEnum(Type).optional(),
});

export type PostCondDTO = z.infer<typeof postCondDTOSchema>

