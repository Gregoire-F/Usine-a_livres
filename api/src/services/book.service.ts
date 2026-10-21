import type { Book, BookRecord, BookWithPages } from "../domain/book"
import type { Clock } from "../domain/clock"
import { ConflictError, NotFoundError } from "../errors/domain.error"
import type { BookRepository } from "../repositories/book.repository"
import type { PageRepository } from "../repositories/page.repository"
import type { BookInput } from "../schemas/book.schema"

/** Met en minuscules et réduit les espaces */
function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase()
}

export class BookService {
  constructor(
    private readonly books: BookRepository,
    private readonly pages: PageRepository,
    private readonly clock: Clock,
  ) {}

  list(): Book[] {
    return this.books.findAll().map((record) => this.toBook(record))
  }

  getById(id: number): BookWithPages {
    const record = this.books.findById(id)
    if (!record) throw new NotFoundError(`Le livre ${id} est introuvable.`)
    const pages = this.pages.findByBookId(id)
    return { ...record, pageCount: pages.length, pages }
  }

  create(input: BookInput): Book {
    this.assertNoDuplicate(input)
    const record = this.books.create({
      ...input,
      createdAt: this.clock.now().toISOString(),
    })
    return this.toBook(record)
  }

  update(id: number, input: BookInput): Book {
    if (!this.books.findById(id)) {
      throw new NotFoundError(`Le livre ${id} est introuvable.`)
    }
    this.assertNoDuplicate(input, id)
    const record = this.books.update(id, input)
    if (!record) throw new NotFoundError(`Le livre ${id} est introuvable.`)
    return this.toBook(record)
  }

  delete(id: number): void {
    if (!this.books.delete(id)) {
      throw new NotFoundError(`Le livre ${id} est introuvable.`)
    }
    this.pages.deleteByBookId(id)
  }

  /** Ajoute le `pageCount` calculé à un livre brut. */
  private toBook(record: BookRecord): Book {
    return { ...record, pageCount: this.pages.findByBookId(record.id).length }
  }

  /** Lève une ConflictError si un AUTRE livre a le même auteur et le même titre. */
  private assertNoDuplicate(input: BookInput, ignoreId?: number): void {
    const title = normalize(input.title)
    const author = normalize(input.author)
    const duplicate = this.books
      .findAll()
      .some(
        (b) =>
          b.id !== ignoreId &&
          normalize(b.title) === title &&
          normalize(b.author) === author,
      )
    if (duplicate) {
      throw new ConflictError("Cet auteur a déjà un livre avec ce titre.")
    }
  }
}