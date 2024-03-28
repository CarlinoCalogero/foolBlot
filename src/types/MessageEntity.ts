import { User } from "./User"

export type MessageEntity = {
    type: string,
    offset: number,
    length: number,
    url?: string, //optional
    user?: User, //optional
    language?: string, //optional
    custom_emoji_id?: string //optional
}