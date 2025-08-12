import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: "**/*.{jsx,tsx,js,ts}",
  })],
  publicDir: 'public',
  server: {
    port: 5500,
    strictPort: false,
    host: '0.0.0.0', // Network erişimi için
    fs: {
      strict: false
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.js',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}'
      ]
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@apps': path.resolve(__dirname, 'src/apps'),
      '@core': path.resolve(__dirname, 'src/core'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    target: process.env.NODE_ENV === 'production' ? 'es2015' : 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Environment service integration
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  // Environment-specific configuration loading
  envDir: '.',
  envPrefix: ['VITE_', 'KIRILMAZLAR_']
})
