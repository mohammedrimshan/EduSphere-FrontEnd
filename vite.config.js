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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis', // Define global variable for polyfills
  },
  optimizeDeps: {
    include: [
      'react-redux',
      '@reduxjs/toolkit',
      'react',
      'react-dom',
      '@react-oauth/google'
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
        }
      }
    }
  }
});