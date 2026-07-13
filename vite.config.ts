import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['cjs'], // Recommended for GitHub Actions entry points on Node
      fileName: () => 'index.js',
    },
    outDir: 'dist',
    minify: false, // Optional: easier to debug on GitHub when not minified
    rollupOptions: {
      // Exclude Node built-in modules from the final bundle
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
    },
  },
});
