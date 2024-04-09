/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ChatMemberAdministrator } from "./types/ChatMemberAdministrator";
import { MessageEntity } from "./types/MessageEntity";
import { Update } from "./types/Update";
import { User } from "./types/User";
import { MI_PIEGO, MIAO, STICKERS, USERS_ID, WOOF, YOOOOOOOOOOO } from "./utils";

export interface Env {
	TELEGRAM_AUTH_TOKEN: string
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

async function processUpdate(request: Request, telegramAuthToken: string) {
	const update: Update = await request.json();
	if ("message" in update) {
		const message = update.message
		//console.log(message)
		if ("text" in message) {
			const userText = message.text;
			const lowerCaseUserText = userText.toLowerCase()
			if (lowerCaseUserText.startsWith("/all")) {
				const response = await fetch(`https://api.telegram.org/bot${telegramAuthToken}/getChatAdministrators?chat_id=${update.message.chat.id}`);
				const responseBody: {
					"ok": boolean,
					"result": ChatMemberAdministrator[]
				} = await response.json();
				const chatMemberAdministrators: ChatMemberAdministrator[] = responseBody.result;

				const messageEntities: MessageEntity[] = [];

				//console.log("bau", chatMemberAdministrators.length, JSON.parse(JSON.stringify(chatMemberAdministrators)))

				let offset: number = 0;
				let message: string = ''

				for (let count = 0; count < chatMemberAdministrators.length; count++) {
					const currentChatMember = chatMemberAdministrators[count]
					const currentUser: User = currentChatMember.user;

					//console.log("current user: ", currentUser)

					if (!currentUser.is_bot && 'username' in currentUser) {
						const mention = `@${currentUser.username}`
						messageEntities.push({
							type: "mention",
							offset: offset,
							length: mention.length,
						})
						if (offset == 0) {
							message = mention
						} else {
							message = `${message} ${mention}`
						}
						offset = mention.length + 1; //+1 is the space
					}
				}

				//console.log("products:", messageEntities, message)
				await replyToMessage(telegramAuthToken, update.message, message, messageEntities)

			}
			// g == global search, i == case-insenstitive search
			const miPiegoRegex: RegExp = /mi piego|mi sono piegato|mi fa piegare|mi fa piega|mi ha fatto piegare|mi ha fatto piega|mi piegai|mi piegher(o|ò)/gmi
			if (miPiegoRegex.test(lowerCaseUserText)) {
				const senderId = message.from.id
				await replyToMessage(telegramAuthToken, update.message, MI_PIEGO[senderId])
			}
			const ciPieghiamoRegex: RegExp = /ci pieghiamo|ci siamo piegati|ci fa piegare|ci fa piega|ci ha fatto piegare|ci ha fatto piega|ci piegammo|ci piegheremo/gmi
			if (ciPieghiamoRegex.test(lowerCaseUserText)) {
				let text = ''
				for (const [key, value] of Object.entries(MI_PIEGO)) {
					text = `${text}\n\n${value}`
				}
				await replyToMessage(telegramAuthToken, update.message, text)
			}
			const yoooRegex: RegExp = /yoo+|yo\s|yo$/gmi
			if (yoooRegex.test(lowerCaseUserText)) {
				await replyToMessage(telegramAuthToken, update.message, YOOOOOOOOOOO.catchPhrase, "", YOOOOOOOOOOO.link)
			}
			const miaoRegex: RegExp = /miao|nya+|nya\s|nya$/gmi
			if (miaoRegex.test(lowerCaseUserText)) {
				await replyToMessage(telegramAuthToken, update.message, MIAO.catchPhrase, "", MIAO.link)
			}
			const sadnessRegex: RegExp = /sad|sadge|triste/gmi
			if (sadnessRegex.test(lowerCaseUserText)) {
				const senderId = message.from.id
				const senderNickname = USERS_ID[senderId]
				let stickerID = ''
				switch (senderNickname) {
					case "cal":
						await sendSticker(telegramAuthToken, message, STICKERS.kana_1)
						stickerID = STICKERS.kana_2
						break;

					case "luco":
						stickerID = STICKERS.ruby
						break;

					case "raffo":
						stickerID = STICKERS.miko
						break;

					case "mano":
						stickerID = STICKERS.aqua
						break;

					case "giacomo":
						stickerID = STICKERS.megumin
						break;

					case "enrico":
						stickerID = STICKERS.kurisu
						break;

					case "mik":
						stickerID = STICKERS.ganyu
						break;
				}

				await sendSticker(telegramAuthToken, message, stickerID)
			}
			if (lowerCaseUserText.includes("bruh")) {
				await sendSticker(telegramAuthToken, message, STICKERS.violin)
			}
			const woofRegex: RegExp = /wo+f|grr+|bark|snarl|arf|bark|awo+/gmi
			if (woofRegex.test(lowerCaseUserText)) {
				await replyToMessage(telegramAuthToken, update.message, WOOF)
			}
		}
	}
}

async function replyToMessage(telegramAuthToken: string, message: any, responseText: string, entities: MessageEntity[] | "" = "", linkUrl: string = "") {
	const chatId = message.chat.id;
	const linkPreviewOptions = {
		url: linkUrl
	}
	const replyParameters = {
		message_id: message.message_id
	}
	const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}&entities=${JSON.stringify(entities)}&reply_parameters=${JSON.stringify(replyParameters)}${linkUrl != "" ? `&link_preview_options=${JSON.stringify(linkPreviewOptions)}` : ""}`;
	await fetch(url);
}

async function sendSticker(telegramAuthToken: string, message: any, stickerFileId: string) {
	const chatId = message.chat.id;
	const replyParameters = {
		message_id: message.message_id
	}
	const url = `https://api.telegram.org/bot${telegramAuthToken}/sendSticker?chat_id=${chatId}&sticker=${stickerFileId}&reply_parameters=${JSON.stringify(replyParameters)}`;
	await fetch(url);
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		await processUpdate(request, env.TELEGRAM_AUTH_TOKEN)
		return new Response('Ok');
	},
};
