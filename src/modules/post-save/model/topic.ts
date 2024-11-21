import z from "zod";

export const topicSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3),
    postCount: z.number().int().nonnegative().default(0),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/i).default('#008000'),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export type Topic = z.infer<typeof topicSchema>;