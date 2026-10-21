import type { NewPage, Page } from "../domain/page";
import type { PageRepository } from "./page.repository";

/**
 * Les pages en mémoire, perdues à l'arrêt du serveur. Même principe que InMemoryBookRepository.
 * Le repository range ce qu'on lui donne : il ne calcule pas les numéros de page, c'est le travail du service.
 */
export class InMemoryPageRepository implements PageRepository {
  private readonly pages = new Map<Number, Page>();
  private lastId = 0;
  /** Les pages du livre, triées par numéro croissant. */
  findByBookId(bookId: number): Page[] {
    return [...this.pages.values()]
      .filter((page) => page.bookId === bookId)
      .sort((a, b) => a.number - b.number);
  }

  findById(id: number): Page | undefined {
    return this.pages.get(id);
  }

  /** Attribuer un id neuf, ranger la page, la renvoyer. */
  create(data: NewPage): Page {
    this.lastId += 1;
    const page: Page = { id: this.lastId, ...data };
    this.pages.set(page.id, page);
    return page;
  }

  /** Changer le numéro et/ou le contenu ; `undefined` si la page n'existe pas. */
  update(
    id: number,
    changes: Partial<Pick<Page, "number" | "content">>,
  ): Page | undefined {
    const existing = this.pages.get(id);
    if (!existing) return undefined;
    const updated: Page = { ...existing, ...changes };
    this.pages.set(id, updated);
    return updated;
  }

  delete(id: number): boolean {
    return this.pages.delete(id);
  }

  deleteByBookId(bookId: number): void {
    for (const page of this.findByBookId(bookId)) {
      this.pages.delete(page.id);
    }
  }
}
