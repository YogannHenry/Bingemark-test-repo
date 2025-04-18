import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, copyFileSync } from 'fs';

// Custom plugin to copy manifest and extension files
const copyExtensionFiles = () => {
  return {
    name: 'copy-extension-files',
    writeBundle: () => {
      // Ensure directories exist
      mkdirSync(resolve(__dirname, 'dist/icons'), { recursive: true });
      
      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(__dirname, 'dist/manifest.json')
      );
      
      // Copy background script directly (no bundling)
      copyFileSync(
        resolve(__dirname, 'src/background.js'),
        resolve(__dirname, 'dist/background.js')
      );
      
      // Copy content script directly (no bundling)
      copyFileSync(
        resolve(__dirname, 'src/contentScript.js'),
        resolve(__dirname, 'dist/contentScript.js')
      );
      
      // Create placeholder icons
      const sizes = [16, 48, 128];
      sizes.forEach(size => {
        writeFileSync(
          resolve(__dirname, `dist/icons/icon${size}.png`),
          Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==', 'base64')
        );
      });
      
      console.log('Extension files copied successfully');
    }
  };
};

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});