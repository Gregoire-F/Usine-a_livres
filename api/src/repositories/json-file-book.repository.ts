import type { BookFields, BookRecord } from "../domain/book"
import type { BookRepository } from "./book.repository"
import type { JsonFile } from "./json-file"

/**
 * Bonus : les livres dans data/books.json, gardés d'un redémarrage à l'autre.
 * Même contrat que InMemoryBookRepository : le reste de l'application ne voit pas la différence.
 * Lire le fichier une fois à la construction, le réécrire après chaque create, update, delete.
 * Id neuf : le plus grand id existant plus un (un redémarrage ne doit pas repartir à 1).
 */
export class JsonFileBookRepository implements BookRepository {
  // À faire : injecter le JsonFile<BookRecord>. Le repository ne le crée pas : container.ts le lui passe.
  constructor() {}

  findAll(): BookRecord[] {
    throw new Error("À faire")
  }

  findById(id: number): BookRecord | undefined {
    throw new Error("À faire")
  }

  create(data: Omit<BookRecord, "id">): BookRecord {
    throw new Error("À faire")
  }

  update(id: number, fields: BookFields): BookRecord | undefined {
    throw new Error("À faire")
  }

  delete(id: number): boolean {
    throw new Error("À faire")
  }
}
