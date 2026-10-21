import { trim, z } from "zod"
import { GENRES } from "../domain/book"
import { idParam } from "./id.schema"

// À faire : le body de POST /books et de PUT /books/:id (le livre entier, les deux routes partagent ce schema).
//   title  : texte, espaces retirés aux deux bouts (trim), 1 à 200 caractères
//   author : texte, trim, 1 à 120 caractères
//   genre  : une des valeurs de GENRES (z.enum)
// Un message en français sur chaque règle : il part tel quel dans la réponse 400.
export const bookInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre est obligatoire.")
    .max(200, "Le titre ne doit pas dépasser 200 caractères."),
  author: z
    .string()
    .trim()
    .min(1, "L'auteur est obligatoire.")
    .max(120, "L'auteur ne doit pas dépasser 120 caractères."),
  genre: z.enum(GENRES, {
    message: "Le genre n'est pas valide.",
  }),
})

/** Le type déduit du schema : ne jamais l'écrire à la main. */
export type BookInput = z.infer<typeof bookInputSchema>

/** Les params de `/books/:id`. Fourni : modèle pour les params des pages. */
export const bookIdParamsSchema = z.object({
  id: idParam,
})

// Bonus JSON : un livre relu depuis data/books.json, champ par champ (id, title, author, genre, createdAt en ISO).
// On ne fait pas confiance au disque : un fichier modifié à la main ne doit pas passer en silence.
export const bookRecordSchema = bookInputSchema.extend ({
  id: idParam,
  createdAt: z.iso.datetime(),
})
