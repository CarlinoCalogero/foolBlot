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

export interface Env {
	TELEGRAM_AUTH_TOK: string
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
		const userText = message.text;
		if (userText.startsWith("/mipiego")) {
			const senderId = message.from.id
			await replyToMessage(telegramAuthToken, update.message, "paprika")
		}
	}
}

async function replyToMessage(telegramAuthToken: string, message: any, responseText: string) {
	const chatId = message.chat.id;
	const replyParameters = {
		message_id: message.message_id
	}
	console.log()
	const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}&reply_parameters=${JSON.stringify(replyParameters)}`;
	console.log(url)
	await fetch(url);
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		await processUpdate(request, env.TELEGRAM_AUTH_TOK)
		return new Response('Ok');
	},
};
