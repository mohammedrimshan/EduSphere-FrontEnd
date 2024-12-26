import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      crypto: true,
      buffer: true,
      stream: true, // Adding other necessary polyfills
      events: true,
      util: true,
      process: true
    }),
  ],
  optimizeDeps: {
    include: ['crypto-browserify', '@react-oauth/google'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-dom': 'react-dom',
      crypto: 'crypto-browserify', // Alias for crypto module
      global: 'globalThis', // Polyfill for global
      stream: 'rollup-plugin-node-polyfills/polyfills/stream', // Polyfill for stream
      events: 'rollup-plugin-node-polyfills/polyfills/events', // Polyfill for events
      util: 'rollup-plugin-node-polyfills/polyfills/util', // Polyfill for util
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6', // Polyfill for buffer
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6', // Polyfill for process
      'webrtc-adapter': 'webrtc-adapter/out/adapter_no_edge_no_global', // WebRTC adapter (specific to your use case)
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis', // Define global variable for polyfills
  },
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills({
          crypto: true,
          buffer: true, // You can toggle these options as needed
        }),
      ],
    },
  },
});
