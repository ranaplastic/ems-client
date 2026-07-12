import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    // For GitHub Pages project sites the app is served from
    // https://<user>.github.io/<repo>/ so the base path must match the repo name.
    // Override with VITE_BASE_PATH in CI if the repo name differs.
    var base = env.VITE_BASE_PATH || '/ems-client/';
    return {
        base: base,
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 5173,
            open: true,
        },
        build: {
            outDir: 'dist',
            sourcemap: false,
            chunkSizeWarningLimit: 1200,
        },
    };
});
