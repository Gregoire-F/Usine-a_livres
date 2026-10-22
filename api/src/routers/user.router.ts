import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import {
  userIdParamsSchema,
  userInputSchema,
  userUpdateSchema,
} from "../schemas/user.schema"
import type { UserService } from "../services/user.service"
import { authenticate } from "./authenticate"
import type { Router } from "./router"

export class UserRouter implements Router {
  constructor(private readonly userService: UserService) {}

  register(app: FastifyInstance): void {
    const routes = app.withTypeProvider<ZodTypeProvider>()

    routes.post(
      "/users",
      { schema: { body: userInputSchema } },
      async (request, reply) => {
        const user = await this.userService.register(request.body)
        return reply.code(201).send(user)
      },
    )

    routes.get("/users", { preHandler: authenticate }, async () => {
      return this.userService.list()
    })

    routes.get(
      "/users/:id",
      { preHandler: authenticate, schema: { params: userIdParamsSchema } },
      async (request) => this.userService.getById(request.params.id),
    )

    routes.put(
      "/users/:id",
      {
        preHandler: authenticate,
        schema: { params: userIdParamsSchema, body: userUpdateSchema },
      },
      async (request) =>
        this.userService.update(request.params.id, request.body),
    )

    routes.delete(
      "/users/:id",
      { preHandler: authenticate, schema: { params: userIdParamsSchema } },
      async (request, reply) => {
        this.userService.delete(request.params.id)
        return reply.code(204).send()
      },
    )
  }
}