import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'motion/react'],
    },
    build: {
      // Triệt để tắt sourcemap trong production để chống dịch ngược mã nguồn
      sourcemap: false,
      minify: 'esbuild' as const,
      cssMinify: true,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          // Xáo trộn định danh file bundle, che giấu kiến trúc thư mục mã nguồn
          chunkFileNames: 'assets/c-[hash].js',
          entryFileNames: 'assets/e-[hash].js',
          assetFileNames: 'assets/a-[hash].[ext]',
        },
      },
    },
    esbuild: {
      // Loại bỏ debugger và chú thích trong production build
      drop: (process.env.NODE_ENV === 'production' ? ['debugger'] : []) as ('debugger' | 'console')[],
      legalComments: 'none' as const,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
