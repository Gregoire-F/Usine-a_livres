import { z } from "zod"
import { idParam } from "./id.schema"

/** Inscription (POST /users). Le mot de passe arrive en clair ici, et uniquement ici. */
export const userInputSchema = z.object({
  email: z.email("L'adresse email n'est pas valide."),
  name: z
    .string()
    .trim()
    .min(1, "Le nom est obligatoire.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(72, "Le mot de passe ne doit pas dépasser 72 caractères."),
})
export type UserInput = z.infer<typeof userInputSchema>

export const userUpdateSchema = userInputSchema.pick({ email: true, name: true })
export type UserUpdate = z.infer<typeof userUpdateSchema>

export const loginSchema = z.object({
  email: z.email("L'adresse email n'est pas valide."),
  password: z.string().min(1, "Le mot de passe est obligatoire."),
})
export type LoginInput = z.infer<typeof loginSchema>

export const userIdParamsSchema = z.object({ id: idParam })

export const userRecordSchema = z.object({
  id: z.number().int().positive(),
  email: z.email(),
  name: z.string().min(1),
  passwordHash: z.string().min(1),
  createdAt: z.iso.datetime(),
})