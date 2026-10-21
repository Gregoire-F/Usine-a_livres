import type { NewPage, Page } from "../domain/page"
import type { JsonFile } from "./json-file"
import type { PageRepository } from "./page.repository"

export class JsonFilePageRepository implements PageRepository {
  private pages: Page[]

  constructor(private readonly file: JsonFile<Page>) {
    this.pages = this.file.read()
  }

  findByBookId(bookId: number): Page[] {
    return this.pages
      .filter((page) => page.bookId === bookId)
      .sort((a, b) => a.number - b.number)
  }

  findById(id: number): Page | undefined {
    return this.pages.find((page) => page.id === id)
  }

  create(data: NewPage): Page {
    const maxId = this.pages.reduce((max, page) => Math.max(max, page.id), 0)
    const page: Page = { id: maxId + 1, ...data }
    this.pages.push(page)
    this.save()
    return page
  }

  update(id: number, changes: Partial<Pick<Page, "number" | "content">>): Page | undefined {
    const existing = this.pages.find((page) => page.id === id)
    if (!existing) return undefined
    const updated: Page = { ...existing, ...changes }
    this.pages[this.pages.indexOf(existing)] = updated
    this.save()
    return updated
  }

  delete(id: number): boolean {
    const index = this.pages.findIndex((page) => page.id === id)
    if (index === -1) return false
    this.pages.splice(index, 1)
    this.save()
    return true
  }

  deleteByBookId(bookId: number): void {
    this.pages = this.pages.filter((page) => page.bookId !== bookId)
    this.save()
  }

  private save(): void {
    this.file.write(this.pages)
  }
}