import bcrypt from "bcryptjs"
import { toUser, type User } from "../domain/user"
import { UnauthorizedError } from "../errors/domain.error"
import type { UserRepository } from "../repositories/user.repository"
import type { LoginInput } from "../schemas/user.schema"

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  /** Vérifie les identifiants. Même erreur que l'email soit inconnu ou le mot de passe faux. */
  async login(input: LoginInput): Promise<User> {
    const record = this.users.findByEmail(input.email)
    const passwordOk = record
      ? await bcrypt.compare(input.password, record.passwordHash)
      : false
    if (!record || !passwordOk) {
      throw new UnauthorizedError("Email ou mot de passe incorrect.")
    }
    return toUser(record)
  }
}