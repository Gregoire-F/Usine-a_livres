import type { UserRecord } from "../domain/user"

export interface UserRepository {
  findAll(): UserRecord[]
  findById(id: number): UserRecord | undefined
  findByEmail(email: string): UserRecord | undefined
  create(data: Omit<UserRecord, "id">): UserRecord
  update(id: number, fields: Partial<Pick<UserRecord, "email" | "name">>): UserRecord | undefined
  delete(id: number): boolean
}