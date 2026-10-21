import type { Page } from "../domain/page";
import { NotFoundError, ValidationError } from "../errors/domain.error";
import type { BookRepository } from "../repositories/book.repository";
import type { PageRepository } from "../repositories/page.repository";
import type { PageInput } from "../schemas/page.schema";

/** Les règles des pages : le livre doit exister, les numéros suivent 1, 2, 3… sans trou, un plafond de pages. */
export class PageService {
  // À faire : injecter par le constructeur
  //   - le PageRepository ;
  //   - le BookRepository : vérifier que le livre existe ;
  //   - le plafond de pages par livre (un `number`) : une valeur de configuration s'injecte comme un objet.
  //     Les tests passent un plafond de 5 au container : il doit arriver jusqu'ici.
  constructor(
    private readonly pages: PageRepository,
    private readonly books: BookRepository,
    private readonly maxPagesPerBook: number,
  ) {}

  /**
   * Ajouter une page à la fin du livre : son numéro vaut le nombre de pages actuel plus un.
   * NotFoundError si le livre n'existe pas ; ValidationError si le livre a déjà atteint le plafond.
   */
  add(bookId: number, input: PageInput): Page {
    this.assertBookExists(bookId);
    const count = this.pages.findByBookId(bookId).length;
    if (count >= this.maxPagesPerBook) {
      throw new ValidationError(
        `Un livre ne peut pas dépasser ${this.maxPagesPerBook} pages.`,
      );
    }
    return this.pages.create({
      bookId,
      number: count + 1,
      content: input.content,
    });
  }

  /**
   * Changer le contenu ; le numéro ne bouge pas.
   * NotFoundError si le livre n'existe pas, si la page n'existe pas, ou si elle appartient à un autre livre :
   * PUT /books/1/pages/7 ne touche jamais une page du livre 2.
   */
  update(bookId: number, pageId: number, input: PageInput): Page {
    this.findPageOfBook(bookId, pageId);
    const updated = this.pages.update(pageId, { content: input.content });
    if (!updated) throw new NotFoundError(`La page ${pageId} est introuvable.`);
    return updated;
  }

  /**
   * Supprimer la page, puis décaler d'un cran le numéro de chaque page qui la suivait : 1, 2, 3 moins la 2 donne 1, 2.
   * Mêmes NotFoundError que update.
   */
  delete(bookId: number, pageId: number): void {
    const page = this.findPageOfBook(bookId, pageId);
    this.pages.delete(pageId);
    for (const next of this.pages.findByBookId(bookId)) {
      if (next.number > page.number) {
        this.pages.update(next.id, { number: next.number - 1 });
      }
    }
  }
  private assertBookExists(bookId: number): void {
    if (!this.books.findById(bookId)) {
      throw new NotFoundError(`Le livre ${bookId} est introuvable.`);
    }
  }
  /** Renvoie la page si elle existe ET appartient à ce livre, sinon NotFoundError. */
  private findPageOfBook(bookId: number, pageId: number): Page {
    this.assertBookExists(bookId);
    const page = this.pages.findById(pageId);
    if (!page || page.bookId !== bookId) {
      throw new NotFoundError(
        `La page ${pageId} est introuvable dans le livre ${bookId}.`,
      );
    }
    return page;
  }
}
