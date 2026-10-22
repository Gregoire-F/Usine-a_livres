/** Un user tel que rangé : avec le hash du mot de passe. */
export type UserRecord = {
  id: number
  email: string
  name: string
  passwordHash: string
  createdAt: string
}

/** Un user tel qu'on le montre au client : sans le hash. */
export type User = Omit<UserRecord, "passwordHash">

export function toUser(record: UserRecord): User {
  const { passwordHash: _passwordHash, ...user } = record
  return user
}