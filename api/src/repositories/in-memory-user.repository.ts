import type { UserRecord } from "../domain/user"
import type { UserRepository } from "./user.repository"

/** Les users en mémoire, perdus à l'arrêt du serveur. */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<number, UserRecord>()
  private lastId = 0

  findAll(): UserRecord[] {
    return [...this.users.values()]
  }

  findById(id: number): UserRecord | undefined {
    return this.users.get(id)
  }

  findByEmail(email: string): UserRecord | undefined {
    return [...this.users.values()].find((user) => user.email === email)
  }

  /** Attribuer un id neuf, ranger le user, le renvoyer. */
  create(data: Omit<UserRecord, "id">): UserRecord {
    this.lastId += 1
    const user: UserRecord = { id: this.lastId, ...data }
    this.users.set(user.id, user)
    return user
  }

  /** Changer l'email et/ou le nom ; `undefined` si le user n'existe pas. */
  update(
    id: number,
    fields: Partial<Pick<UserRecord, "email" | "name">>,
  ): UserRecord | undefined {
    const existing = this.users.get(id)
    if (!existing) return undefined
    const updated: UserRecord = { ...existing, ...fields }
    this.users.set(id, updated)
    return updated
  }

  /** `true` si le user existait. */
  delete(id: number): boolean {
    return this.users.delete(id)
  }
}