import bcrypt from "bcryptjs"
import type { Clock } from "../domain/clock"
import { toUser, type User } from "../domain/user"
import { ConflictError, NotFoundError } from "../errors/domain.error"
import type { UserInput, UserUpdate } from "../schemas/user.schema"
import type { UserRepository } from "../repositories/user.repository"

const SALT_ROUNDS = 10


export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly clock: Clock,
  ) {}

  list(): User[] {
    return this.users.findAll().map(toUser)
  }

  getById(id: number): User {
    const record = this.users.findById(id)
    if (!record) throw new NotFoundError(`L'utilisateur ${id} est introuvable.`)
    return toUser(record)
  }

  async register(input: UserInput): Promise<User> {
    if (this.users.findByEmail(input.email)) {
      throw new ConflictError("Cette adresse email est déjà utilisée.")
    }
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)
    const record = this.users.create({
      email: input.email,
      name: input.name,
      passwordHash,
      createdAt: this.clock.now().toISOString(),
    })
    return toUser(record)
  }

  update(id: number, input: UserUpdate): User {
    if (!this.users.findById(id)) {
      throw new NotFoundError(`L'utilisateur ${id} est introuvable.`)
    }
    const other = this.users.findByEmail(input.email)
    if (other && other.id !== id) {
      throw new ConflictError("Cette adresse email est déjà utilisée.")
    }
    const record = this.users.update(id, input)
    if (!record) throw new NotFoundError(`L'utilisateur ${id} est introuvable.`)
    return toUser(record)
  }

  delete(id: number): void {
    if (!this.users.delete(id)) {
      throw new NotFoundError(`L'utilisateur ${id} est introuvable.`)
    }
  }
}