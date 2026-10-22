import { buildApp } from "./app"
import { Container } from "./container"

const port = Number(process.env.PORT ?? 3000)
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173"
const jwtSecret = process.env.JWT_SECRET


const app = buildApp(new Container(), { logger: true, webOrigin, jwtSecret })
await app.listen({ port })
