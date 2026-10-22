import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { loginSchema } from "../schemas/user.schema"
import type { AuthService } from "../services/auth.service"
import type { Router } from "./router"

export class AuthRouter implements Router {
  constructor(private readonly authService: AuthService) {}

  register(app: FastifyInstance): void {
    const routes = app.withTypeProvider<ZodTypeProvider>()

    routes.post(
      "/auth/login",
      { schema: { body: loginSchema } },
      async (request) => {
        const user = await this.authService.login(request.body)
        const token = app.jwt.sign(
          { sub: String(user.id), email: user.email },
          { expiresIn: "1h" },
        )
        return { token, user }
      },
    )
  }
}