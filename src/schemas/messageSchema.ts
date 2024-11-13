import { z } from "zod";


export const messageSchema = z.object({
    content: z.string()
            .min(10, "Content must be of atleast 10 characters")
            .max(300, "Content can be at most 300 characters")
});