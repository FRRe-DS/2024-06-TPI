import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3001, // O el puerto que quieras usar
		host: true // Esto permite que el servidor sea accesible desde fuera de localhost
	}
});
