import type { BookFields, BookRecord } from "../domain/book";
import type { BookRepository } from "./book.repository";
import type { JsonFile } from "./json-file";

/**
 * Bonus : les livres dans data/books.json, gardés d'un redémarrage à l'autre.
 * Même contrat que InMemoryBookRepository : le reste de l'application ne voit pas la différence.
 * Lire le fichier une fois à la construction, le réécrire après chaque create, update, delete.
 * Id neuf : le plus grand id existant plus un (un redémarrage ne doit pas repartir à 1).
 */
export class JsonFileBookRepository implements BookRepository {
  private readonly books: BookRecord[];

  constructor(private readonly file: JsonFile<BookRecord>) {
    // Lire le fichier une seule fois, à la construction
    this.books = this.file.read();
  }

  findAll(): BookRecord[] {
    return [...this.books];
  }

  findById(id: number): BookRecord | undefined {
    return this.books.find((book) => book.id === id);
  }

  create(data: Omit<BookRecord, "id">): BookRecord {
    // Plus grand id existant + 1 (1 si le fichier est vide)
    const maxId = this.books.reduce((max, book) => Math.max(max, book.id), 0);
    const book: BookRecord = { id: maxId + 1, ...data };
    this.books.push(book);
    this.save();
    return book;
  }

  update(id: number, fields: BookFields): BookRecord | undefined {
    const existing = this.books.find((book) => book.id === id);
    if (!existing) return undefined;
    const updated: BookRecord = { ...existing, ...fields };
    const index = this.books.indexOf(existing);
    this.books[index] = updated;
    this.save();
    return updated;
  }

  delete(id: number): boolean {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) return false;
    this.books.splice(index, 1);
    this.save();
    return true;
  }

  private save(): void {
    this.file.write(this.books);
  }
}
