/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_API_URL?: string;
}

declare namespace App {
	interface Locals {
		user?: { id: string; email: string };
	}
}
