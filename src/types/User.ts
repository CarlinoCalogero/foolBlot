export type User = {
    id: number,
    is_bot: boolean,
    first_name: string,
    last_name: string, //optional
    username: string, //optional
    language_code: string, //optional
    is_premium: boolean, //optional
    added_to_attachment_menu: boolean, //optional
    can_join_groups: boolean, //optional
    can_read_all_group_messages: boolean, //optional
    supports_inline_queries: boolean //optional
}