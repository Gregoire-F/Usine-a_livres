import { z } from "zod"

/**
 * Bonus : un tableau rangé dans un fichier JSON. Les deux repositories JSON en reçoivent chacun un.
 * Outils : `existsSync`, `readFileSync`, `writeFileSync`, `mkdirSync` (node:fs) et `dirname` (node:path).
 */
export class JsonFile<T> {
  // À faire : recevoir par le constructeur le chemin du fichier et le schema Zod d'un élément (z.ZodType<T>).
  constructor() {}

  /**
   * Le contenu du fichier, ou `[]` s'il n'existe pas encore.
   * Passer le texte lu par JSON.parse, puis par `z.array(schema).parse(...)` : pas de `as T[]`.
   */
  read(): T[] {
    throw new Error("À faire")
  }

  /** Réécrire tout le fichier (JSON indenté) ; créer le dossier s'il manque. */
  write(items: readonly T[]): void {
    throw new Error("À faire")
  }
}
