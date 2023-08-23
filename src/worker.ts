import { Hono } from 'hono'
import { cmd } from './cmd'
import { Signature } from './types'

const BEDROOM_CURTAIN_DEVICE_ID = 'FCF3426166C0'
const STORAGE_DOOR_DEVICE_ID = 'D9AC1DEA9306'

export type Env = {
	SWITCHBOT_PROXY_API_SECRET: string
	SWITCHBOT_TOKEN: string
	SWITCHBOT_SECRET: string
}

async function createSignature(token: string, secret: string): Promise<Signature> {
	const t = Date.now().toString()
	const nonce = crypto.randomUUID()
	const data = token + t + nonce

	const encoder = new TextEncoder()
	const secretKeyData = encoder.encode(secret)
	const key = await crypto.subtle.importKey('raw', secretKeyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
	const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
	const sign = btoa(String.fromCharCode(...new Uint8Array(mac)))

	return { t, nonce, sign, token }
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', async (c, next) => {
	const authHeader = c.req.headers.get('Authorization')

	if (authHeader !== c.env.SWITCHBOT_PROXY_API_SECRET) {
		console.error('Invalid API key')
		return new Response(null, { status: 401, statusText: 'Unauthorized' })
	}

	await next()
})

app.get('/devices', async (c) => {
	const signature = await createSignature(c.env.SWITCHBOT_TOKEN, c.env.SWITCHBOT_SECRET)
	const res = await cmd(signature, '/devices')

	return c.json(res)
})

app.get('/bedroom-curtains', async (c) => {
	const signature = await createSignature(c.env.SWITCHBOT_TOKEN, c.env.SWITCHBOT_SECRET)
	const res = await cmd(signature, `/devices/${BEDROOM_CURTAIN_DEVICE_ID}/status`)

	return c.json(res)
})

app.post('/bedroom-curtains/open', async (c) => {
	const signature = await createSignature(c.env.SWITCHBOT_TOKEN, c.env.SWITCHBOT_SECRET)
	const res = await cmd(
		signature,
		`/devices/${BEDROOM_CURTAIN_DEVICE_ID}/commands`,
		JSON.stringify({
			commandType: 'command',
			command: 'turnOn',
		})
	)

	return c.json(res)
})

app.post('/bedroom-curtains/close', async (c) => {
	const signature = await createSignature(c.env.SWITCHBOT_TOKEN, c.env.SWITCHBOT_SECRET)
	const res = await cmd(
		signature,
		`/devices/${BEDROOM_CURTAIN_DEVICE_ID}/commands`,
		JSON.stringify({
			commandType: 'command',
			command: 'turnOff',
		})
	)

	return c.json(res)
})

app.get('/storage-door', async (c) => {
	const signature = await createSignature(c.env.SWITCHBOT_TOKEN, c.env.SWITCHBOT_SECRET)
	const res = await cmd(signature, `/devices/${STORAGE_DOOR_DEVICE_ID}/status`)

	return c.json(res)
})

app.post('/storage-door/unlock', async (c) => {
	const signature = await createSignature(c.env.SWITCHBOT_TOKEN, c.env.SWITCHBOT_SECRET)
	const res = await cmd(
		signature,
		`/devices/${STORAGE_DOOR_DEVICE_ID}/commands`,
		JSON.stringify({
			commandType: 'command',
			command: 'unlock',
		})
	)

	return c.json(res)
})

app.post('/storage-door/lock', async (c) => {
	const signature = await createSignature(c.env.SWITCHBOT_TOKEN, c.env.SWITCHBOT_SECRET)
	const res = await cmd(
		signature,
		`/devices/${STORAGE_DOOR_DEVICE_ID}/commands`,
		JSON.stringify({
			commandType: 'command',
			command: 'lock',
		})
	)

	return c.json(res)
})

export default app

// export default {
// 	// fetch: app.fetch
// 	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
// 		if (Math.random() > 0) {
// 			const signature = await createSignature(env.SWITCHBOT_TOKEN, env.SWITCHBOT_SECRET)
// 			const res = await cmd(signature, '/devices')
// 			console.log(signature, res)
// 			return new Response(null)
// 		}

// 		const auth = request.headers.get('Authorization')

// 		if (auth !== env.SWITCHBOT_PROXY_API_SECRET) {
// 			console.error('Invalid API key')
// 			return new Response(null, { status: 401, statusText: 'Unauthorized' })
// 		}

// 		return new Response(null, { status: 404 })
// 	},
// }
