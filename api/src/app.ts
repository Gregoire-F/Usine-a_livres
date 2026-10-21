import cors from "@fastify/cors"
import Fastify, { type FastifyInstance } from "fastify"
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import type { Container } from "./container"
import { ConflictError, DomainError, NotFoundError, ValidationError } from "./errors/domain.error"

export type AppOptions = {
  logger?: boolean
  /** L'origine du front autorisée par CORS. */
  webOrigin?: string
}

/** Le corps de toute réponse d'erreur de l'API. */
export type ErrorBody = {
  error: string
  message: string
  details?: { path: string; message: string }[]
}

/** Construit l'application sans la lancer : `server.ts` la lance, les tests l'appellent par `app.inject`. */
export function buildApp(container: Container, options: AppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false })

  // Fourni : Zod valide les params et les bodies déclarés dans `schema`, à la place de JSON Schema.
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // Fourni : le front (port 5173) a le droit d'appeler l'API (port 3000).
  app.register(cors, {
    origin: options.webOrigin ?? "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })

  // Fourni : une route qui n'existe pas répond 404 RouteNotFound ; le front affiche « Route non implémentée ».
  app.setNotFoundHandler((request, reply) => {
    const body: ErrorBody = { error: "RouteNotFound", message: `Route ${request.method} ${request.url} inconnue` }
    return reply.code(404).send(body)
  })

app.setErrorHandler((error, request, reply) => {
  // 1. Une erreur du domaine : le statut dépend de sa classe
  if (error instanceof DomainError) {
    const status =
      error instanceof NotFoundError ? 404 :
      error instanceof ConflictError ? 409 :
      error instanceof ValidationError ? 400 :
      500
    const body: ErrorBody = { error: error.name, message: error.message }
    return reply.code(status).send(body)
  }

  // 2. Une erreur de validation Zod (params ou body invalide)
  if (hasZodFastifySchemaValidationErrors(error)) {
    const details = error.validation.map((issue) => ({
      path: issue.instancePath,
      message: issue.message,
    }))
    const body: ErrorBody = {
      error: "ValidationError",
      message: details.map((d) => d.message).join(" ") || "Requête invalide.",
    }
    return reply.code(400).send(body)
  }

  // 3. Une méthode encore vide : 501
  if (error instanceof Error && error.message === "À faire") {
    const body: ErrorBody = { error: "NotImplemented", message: "À faire" }
    return reply.code(501).send(body)
  }

  // 4. Une autre erreur 4xx déjà classée par Fastify (JSON mal formé...)
  const fastifyStatus = (error as { statusCode?: number }).statusCode
  if (fastifyStatus !== undefined && fastifyStatus >= 400 && fastifyStatus < 500) {
    const body: ErrorBody = {
      error: "BadRequest",
      message: error instanceof Error ? error.message : "Requête invalide.",
    }
    return reply.code(fastifyStatus).send(body)
  }

  // 5. Tout le reste : on logue, on répond de façon générique
  request.log.error(error)
  const body: ErrorBody = { error: "InternalServerError", message: "Erreur interne du serveur" }
  return reply.code(500).send(body)
})

  // À faire : brancher les routers du container. Chacun déclare ses routes sur `app` par sa méthode register.

  for(const router of container.routers){
    router.register(app)
  }

  return app
}
