import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { bookIdParamsSchema, bookInputSchema } from "../schemas/book.schema";
import type { BookService } from "../services/book.service";
import type { Router } from "./router";

/** Les routes `/books`. Un router mince : il reçoit, il délègue, il répond. */
export class BookRouter implements Router {
  // À faire : injecter le BookService. Le router ne connaît que le service, jamais un repository.
  constructor(private readonly bookService: BookService) {}

  register(app: FastifyInstance): void {
    // À faire : déclarer les cinq routes des livres.
    //
    //   GET    /books        200  la liste
    //   GET    /books/:id    200  le livre et ses pages     params : bookIdParamsSchema
    //   POST   /books        201  le livre créé             body   : bookInputSchema
    //   PUT    /books/:id    200  le livre modifié          params + body
    //   DELETE /books/:id    204  sans body
    //
    // Pour que request.params et request.body soient typés d'après les schemas Zod :
    //   const routes = app.withTypeProvider<ZodTypeProvider>()
    //   routes.get("/books/:id", { schema: { params: bookIdParamsSchema } }, async (request) => ...)
    //
    // Chaque handler appelle UNE méthode du service et choisit le statut (reply.code(201)).
    // Aucune règle ici : un livre introuvable, c'est le service qui lève NotFoundError, et app.ts qui en fait un 404.
    const routes = app.withTypeProvider<ZodTypeProvider>();

    routes.get("/books", async () => {
      return this.bookService.list();
    });

    routes.get(
      "/books/:id",
      { schema: { params: bookIdParamsSchema } },
      async (request) => {
        return this.bookService.getById(request.params.id);
      },
    );

    routes.post(
      "/books",
      { schema: { body: bookInputSchema } },
      async (request, reply) => {
        const book = this.bookService.create(request.body);
        return reply.code(201).send(book);
      },
    );

    routes.put(
      "/books/:id",
      { schema: { params: bookIdParamsSchema, body: bookInputSchema } },
      async (request) => {
        return this.bookService.update(request.params.id, request.body);
      },
    );

    routes.delete(
      "/books/:id",
      { schema: { params: bookIdParamsSchema } },
      async (request, reply) => {
        this.bookService.delete(request.params.id);
        return reply.code(204).send();
      },
    );
  }
}
