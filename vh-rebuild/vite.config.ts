import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({plugins:[react(),tailwindcss()],base:'./',resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},build:{outDir:'build',rollupOptions:{input:{main:fileURLToPath(new URL('./index.html',import.meta.url)),vinyl:fileURLToPath(new URL('./vinyl-preview.html',import.meta.url))},output:{manualChunks:{motion:['framer-motion'],gsap:['gsap']}}}}});
