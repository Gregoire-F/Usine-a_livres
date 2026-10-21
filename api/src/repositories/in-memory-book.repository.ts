import type { BookFields, BookRecord } from "../domain/book"
import type { BookRepository } from "./book.repository"

/**
 * Les livres en mémoire, perdus à l'arrêt du serveur.
 * Choisir le rangement interne (un tableau ou une `Map`, en `private`) et un compteur pour les id.
 * Aucune règle métier ici : pas de doublon à vérifier, pas d'erreur à lever. Un livre absent, c'est `undefined`.
 */
export class InMemoryBookRepository implements BookRepository {
  private readonly books = new Map<number, BookRecord>()
  private lastId = 0

  findAll(): BookRecord[] {
    return [...this.books.values()]
  }

  findById(id: number): BookRecord | undefined {
    return this.books.get(id)
  }

  /** Attribuer un id neuf (1, 2, 3…), ranger le livre, le renvoyer. */
  create(data: Omit<BookRecord, "id">): BookRecord {
   this.lastId += 1
    const book: BookRecord = { id: this.lastId, ...data }
    this.books.set(book.id, book)
    return book
  }

  /** Remplacer les champs du livre ; `undefined` s'il n'existe pas. */
  update(id: number, fields: BookFields): BookRecord | undefined {
    const existing = this.books.get(id)
    if (!existing) return undefined
    const updated: BookRecord = { ...existing, ...fields }
    this.books.set(id, updated)
    return updated
  }

  /** `true` si le livre existait. */
  delete(id: number): boolean {
     return this.books.delete(id)
  }
}
