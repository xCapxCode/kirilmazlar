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
    port: 5000,
    strictPort: true, // ZORUNLU: Başka port kullanmaya izin verme
    host: 'localhost',
    fs: {
      strict: true,
      allow: ['./src', './public', './node_modules']
    }
  },
  preview: {
    port: 5000,
    strictPort: true, // ZORUNLU: Preview için de sadece 5000
    host: 'localhost'
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
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    target: process.env.NODE_ENV === 'production' ? 'es2020' : 'esnext',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        passes: 2
      },
      mangle: {
        safari10: true,
        keep_fnames: false
      },
      format: {
        comments: false,
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'vendor-icons';
            }
            return 'vendor-misc';
          }
          // App chunks
          if (id.includes('/src/apps/admin/')) {
            return 'app-admin';
          }
          if (id.includes('/src/apps/customer/')) {
            return 'app-customer';
          }
          if (id.includes('/src/shared/')) {
            return 'shared';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Bundle size optimizations
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
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
