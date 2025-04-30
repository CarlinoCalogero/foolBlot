import { User } from "./User"

export type ChatMemberBanned = {
    status: string,
    user: User,
    until_date: number
}