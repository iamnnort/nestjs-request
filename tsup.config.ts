import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  splitting: true,
  sourcemap: true,
  external: ['@nestjs/microservices', '@nestjs/websockets'],
});
