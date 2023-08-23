export interface Signature {
	t: string
	nonce: string
	sign: string
	token: string
}

export interface Common {
	deviceId: string
	deviceName: string
	deviceType: string
	enabledCloudService: boolean
	hubDeviceId: string
}

export interface Hub extends Common {
	hubDeviceId: string
}

export interface Curtain extends Common {
	calibrate: boolean
	master: boolean
}

export interface Lock extends Common {
	group: boolean
	master: boolean
	groupName: string
	lockDevicesIds: string[]
}

export type Device = Curtain | Hub | Lock
