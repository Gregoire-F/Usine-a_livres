import type { FastifyInstance } from "fastify";
import {
  bookPagesParamsSchema,
  pageInputSchema,
  pageParamsSchema,
} from "../schemas/page.schema";
import type { PageService } from "../services/page.service";
import type { Router } from "./router";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

/** Les routes `/books/:id/pages` : une page n'existe que dans un livre. */
export class PageRouter implements Router {
  // À faire : injecter le PageService.
  constructor(private readonly pageService: PageService) {}

  register(app: FastifyInstance): void {
    // À faire : déclarer les trois routes des pages, sur le modèle de BookRouter.
    //
    //   POST   /books/:id/pages            201  la page créée    params : bookPagesParamsSchema, body : pageInputSchema
    //   PUT    /books/:id/pages/:pageId    200  la page modifiée params : pageParamsSchema, body : pageInputSchema
    //   DELETE /books/:id/pages/:pageId    204  sans body        params : pageParamsSchema

    const routes = app.withTypeProvider<ZodTypeProvider>();
    routes.post(
      "/books/:id/pages",
      { schema: { params: bookPagesParamsSchema, body: pageInputSchema } },
      async (request, reply) => {
        const page = this.pageService.add(request.params.id, request.body);
        return reply.code(201).send(page);
      },
    );

    routes.put(
      "/books/:id/pages/:pageId",
      { schema: { params: pageParamsSchema, body: pageInputSchema } },
      async (request) => {
        const { id, pageId } = request.params;
        return this.pageService.update(id, pageId, request.body);
      },
    );

    routes.delete(
      "/books/:id/pages/:pageId",
      { schema: { params: pageParamsSchema } },
      async (request, reply) => {
        const { id, pageId } = request.params;
        this.pageService.delete(id, pageId);
        return reply.code(204).send();
      },
    );
  }
}
