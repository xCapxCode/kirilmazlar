import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic'
    }),
    
    // Bundle analyzer (only in build mode)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@core': resolve(__dirname, 'src/core')
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: false,
    cors: true,
    // Proxy API calls to backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Build optimization
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Minimize bundle size
    minify: 'terser',
    
    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        safari10: true
      }
    },
    
    // Rollup options
    rollupOptions: {
      // External dependencies that shouldn't be bundled
      external: [],
      
      output: {
        // Automatic chunk splitting for optimal caching
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        },
        
        // Chunk file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.js', '')
            : 'chunk';
          return `chunks/${facadeModuleId}-[hash].js`;
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `styles/[name]-[hash].${ext}`;
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Asset size warning limit
    assetsInlineLimit: 4096,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true
  },
  
  // CSS configuration
  css: {
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCase'
    },
    
    // PostCSS configuration
    postcss: {
      plugins: [
        // Add autoprefixer and other PostCSS plugins here if needed
      ]
    },
    
    // CSS preprocessing
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ],
    
    // Exclude dependencies from pre-bundling
    exclude: [
      // Add any dependencies that should not be pre-bundled
    ]
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  
  // Preview server (for production build testing)
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  
  // ESBuild configuration
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    
    // JSX configuration
    jsx: 'automatic',
    
    // Target modern browsers
    target: 'es2020'
  },
  
  // Worker configuration
  worker: {
    format: 'es'
  }
});

// Performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Vite development server starting...');
  console.log('📊 Performance monitoring enabled');
  console.log('🔧 Hot reload enabled');
}

// Build analysis
if (process.env.ANALYZE) {
  console.log('📈 Bundle analysis will be generated at dist/stats.html');
}