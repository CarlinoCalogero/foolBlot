/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Update } from "./types/Update";
import { MIK, MI_PIEGO, WOOF, YOOOOOOOOOOO } from "./utils";

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
		// console.log(message)
		if ("text" in message) {
			const userText = message.text;
			if (userText.toLowerCase().includes("mi piego")) {
				const senderId = message.from.id
				await replyToMessage(telegramAuthToken, update.message, MI_PIEGO[senderId])
			}
			const yoooRegex: RegExp = /yoo+|yo\s|yo$/gmi
			if (yoooRegex.test(userText)) {
				await replyToMessage(telegramAuthToken, update.message, YOOOOOOOOOOO.catchPhrase, YOOOOOOOOOOO.link)
			}
			// g == global search, i == case-insenstitive search
			const mikRegex: RegExp = /mik/gmi
			if (mikRegex.test(userText)) {
				await sendSticker(telegramAuthToken, message)
			}
			const woofRegex: RegExp = /wo+f|grr+|bark|snarl|arf|bark|awo+/gmi
			if (woofRegex.test(userText)) {
				await replyToMessage(telegramAuthToken, update.message, WOOF)
			}
		}
	}
}

async function replyToMessage(telegramAuthToken: string, message: any, responseText: string, linkUrl: string = "") {
	const chatId = message.chat.id;
	const linkPreviewOptions = {
		url: linkUrl
	}
	const replyParameters = {
		message_id: message.message_id
	}
	const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}&reply_parameters=${JSON.stringify(replyParameters)}${linkUrl != "" ? `&link_preview_options=${JSON.stringify(linkPreviewOptions)}` : ""}`;
	await fetch(url);
}

async function sendSticker(telegramAuthToken: string, message: any) {
	const chatId = message.chat.id;
	const replyParameters = {
		message_id: message.message_id
	}
	const url = `https://api.telegram.org/bot${telegramAuthToken}/sendSticker?chat_id=${chatId}&sticker=${MIK.stickerFileId}&reply_parameters=${JSON.stringify(replyParameters)}`;
	await fetch(url);
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		await processUpdate(request, env.TELEGRAM_AUTH_TOKEN)
		return new Response('Ok');
	},
};
