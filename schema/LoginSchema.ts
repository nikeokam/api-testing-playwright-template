import { z } from "zod";

export const loginRequestBodySchema = z.object({
  username: z.string(),
  password: z.string()
}).strict();

export const TokenSchema = z.jwt()