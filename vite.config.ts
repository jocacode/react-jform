import { resolve } from 'path';
import { defineConfig } from 'vite';
import path from 'node:path';
import dts from 'vite-plugin-dts';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: { alias: { '@src': resolve('./src') } },
  plugins: [
    tsConfigPaths({}),
    dts({
      insertTypesEntry: true,
      include: ['*/*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'react-jstore',
      formats: ['es'],
      fileName: 'index',
    },
    emptyOutDir: true,
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        format: 'es',
        dir: 'dist/',
      },
    },
  },
});
