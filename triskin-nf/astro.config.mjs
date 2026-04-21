// @ts-check

import node from '@astrojs/node';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// SSR + middleware (cookie + JWT) exigem adapter Node. Tailwind 4 via PostCSS.

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	integrations: [react()],
});
