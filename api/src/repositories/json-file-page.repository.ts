import type { NewPage, Page } from "../domain/page"
import type { JsonFile } from "./json-file"
import type { PageRepository } from "./page.repository"

/** Bonus : les pages dans data/pages.json. Même principe que JsonFileBookRepository. */
export class JsonFilePageRepository implements PageRepository {
  // À faire : injecter le JsonFile<Page>.
  constructor() {}

  findByBookId(bookId: number): Page[] {
    throw new Error("À faire")
  }

  findById(id: number): Page | undefined {
    throw new Error("À faire")
  }

  create(data: NewPage): Page {
    throw new Error("À faire")
  }

  update(id: number, changes: Partial<Pick<Page, "number" | "content">>): Page | undefined {
    throw new Error("À faire")
  }

  delete(id: number): boolean {
    throw new Error("À faire")
  }

  deleteByBookId(bookId: number): void {
    throw new Error("À faire")
  }
}
