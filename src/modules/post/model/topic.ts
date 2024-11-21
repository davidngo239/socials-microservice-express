import z from "zod";
import { ErrTopicColorInvalid, ErrTopicNameInvalid } from "./error";

export const topicSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3, ErrTopicNameInvalid.message),
    postCount: z.number().int().nonnegative().default(0),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, ErrTopicColorInvalid.message).default('#008000'),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export type Topic = z.infer<typeof topicSchema>;