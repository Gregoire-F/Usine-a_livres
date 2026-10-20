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
    // À faire : traduire chaque erreur en réponse HTTP, au format ErrorBody.
    //   - Une DomainError (instanceof) : NotFoundError 404, ValidationError 400, ConflictError 409,
    //     body { error: error.name, message: error.message }.
    //   - Une erreur de validation Zod (hasZodFastifySchemaValidationErrors(error)) : 400, error "ValidationError",
    //     message tiré de error.validation (un tableau : chaque élément a un `message` et un `instancePath`).
    //   - Une autre erreur 4xx déjà classée par Fastify (JSON mal formé : 400) : garder son statusCode.
    //   - Tout le reste : la logger, puis 500 avec un message générique. Rien de l'erreur d'origine ne part au client.

    // Fourni : une méthode encore vide lève « À faire » ; elle répond 501, le front affiche « Route non implémentée ».
    if (error instanceof Error && error.message === "À faire") {
      const body: ErrorBody = { error: "NotImplemented", message: "À faire" }
      return reply.code(501).send(body)
    }
    request.log.error(error)
    const body: ErrorBody = { error: "InternalServerError", message: "Erreur interne du serveur" }
    return reply.code(500).send(body)
  })

  // À faire : brancher les routers du container. Chacun déclare ses routes sur `app` par sa méthode register.

  return app
}
