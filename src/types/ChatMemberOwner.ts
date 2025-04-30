import { User } from "./User"

export type ChatMemberOwner = {
    status: string,
    user: User,
    is_anonymous: boolean,
    custom_title: string
}