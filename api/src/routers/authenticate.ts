import type { FastifyRequest } from "fastify"
import { UnauthorizedError } from "../errors/domain.error"

/** À mettre en `preHandler` : refuse la requête sans token valide (401). */
export async function authenticate(request: FastifyRequest): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedError("Token absent ou invalide.")
  }
}