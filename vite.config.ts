import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  build: {
    // Otimizações de bundle
    rollupOptions: {
      output: {
        // Manual chunks para melhor cache e carregamento paralelo
        manualChunks: {
          // Core React - carregado sempre
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Components - Radix e Shadcn
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-switch',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-avatar',
            '@radix-ui/react-progress',
          ],
          
          // Charts - Recharts (pesado, lazy loaded)
          'vendor-charts': ['recharts'],
          
          // Drag and Drop - dnd-kit (usado apenas no CRM)
          'vendor-dnd': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
          ],
          
          // Data fetching e state management
          'vendor-query': ['@tanstack/react-query'],
          
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // Utilities
          'vendor-utils': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'zod',
          ],
          
          // Forms
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
          ],
        },
      },
    },
    // Aumentar limite de warning para chunks (alguns vendor chunks serão grandes)
    chunkSizeWarningLimit: 600,
    // Minificação otimizada
    minify: 'esbuild',
    // Source maps apenas em desenvolvimento
    sourcemap: mode === 'development',
  },
}));
