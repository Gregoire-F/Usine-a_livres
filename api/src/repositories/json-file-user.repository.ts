import type { UserRecord } from "../domain/user"
import type { JsonFile } from "./json-file"
import type { UserRepository } from "./user.repository"

/** Les users dans data/users.json, gardés d'un redémarrage à l'autre. */
export class JsonFileUserRepository implements UserRepository {
  private readonly users: UserRecord[]

  constructor(private readonly file: JsonFile<UserRecord>) {
    this.users = this.file.read()
  }

  findAll(): UserRecord[] {
    return [...this.users]
  }

  findById(id: number): UserRecord | undefined {
    return this.users.find((user) => user.id === id)
  }

  findByEmail(email: string): UserRecord | undefined {
    return this.users.find((user) => user.email === email)
  }

  create(data: Omit<UserRecord, "id">): UserRecord {
    const maxId = this.users.reduce((max, user) => Math.max(max, user.id), 0)
    const user: UserRecord = { id: maxId + 1, ...data }
    this.users.push(user)
    this.save()
    return user
  }

  update(
    id: number,
    fields: Partial<Pick<UserRecord, "email" | "name">>,
  ): UserRecord | undefined {
    const existing = this.users.find((user) => user.id === id)
    if (!existing) return undefined
    const updated: UserRecord = { ...existing, ...fields }
    this.users[this.users.indexOf(existing)] = updated
    this.save()
    return updated
  }

  delete(id: number): boolean {
    const index = this.users.findIndex((user) => user.id === id)
    if (index === -1) return false
    this.users.splice(index, 1)
    this.save()
    return true
  }

  private save(): void {
    this.file.write(this.users)
  }
}