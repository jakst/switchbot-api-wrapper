import { Signature } from './types'

export async function cmd<T>(signature: Signature, endpoint: string, body?: string) {
	const headers = {
		t: signature.t,
		nonce: signature.nonce,
		sign: signature.sign,
		Authorization: signature.token,
	}

	const req = await fetch(`https://api.switch-bot.com/v1.1${endpoint}`, {
		method: body ? 'POST' : 'GET',
		body,
		headers: body
			? {
					...headers,
					'Content-Type': 'application/json',
					'Content-Length': body.length.toString(),
			  }
			: headers,
	})

	console.log({ ok: req.ok, status: req.status, statusText: req.statusText })

	const res: { statusCode: number; message: string; body: T } = await req.json()
	return res.body
}
