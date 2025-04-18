import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs-extra';

// Custom plugin to copy extension files
const copyExtensionFiles = () => {
  return {
    name: 'copy-extension-files',
    closeBundle: async () => {
      // Extension files to copy - with careful handling of JS files
      const files = [
        { src: 'src/manifest.json', dest: 'dist/manifest.json' },
        { src: 'src/background.js', dest: 'dist/background.js' },
        { src: 'src/contentScript.js', dest: 'dist/contentScript.js' },
        { src: 'src/import-export.js', dest: 'dist/import-export.js' },
        { src: 'src/import-export.html', dest: 'dist/import-export.html' },
        { src: 'src/styles.css', dest: 'dist/styles.css' }
      ];

      // Copy icon files
      if (await fs.pathExists('src/icons')) {
        await fs.copy('src/icons', 'dist/icons', { overwrite: true });
        console.log('Icons copied successfully!');
      }
      
      // Copy individual files
      for (const file of files) {
        if (await fs.pathExists(file.src)) {
          await fs.copy(file.src, file.dest, { overwrite: true });
          console.log(`Copied ${file.src} to ${file.dest}`);
        } else {
          console.warn(`Warning: ${file.src} does not exist`);
        }
      }
      
      console.log('Extension files copied successfully!');
    }
  };
};

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    minify: false, // Disable minification for better debugging
    sourcemap: true, // Enable sourcemaps for better debugging
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
});