import { build } from 'esbuild';

// Wildcards aren’t supported, so list explicit roots.
const externals = [
  'aws-sdk', // default
  'cache-manager',
  '@nestjs/microservices',
  '@nestjs/websockets',
  '@nestjs/websockets/socket-module',
  '@nestjs/microservices/microservices-module',
];

 await build({
   entryPoints: ['src/lambda.ts'],
   bundle: true,
   platform: 'node',
   target: 'node20',
   outfile: 'dist/bundle.js',
   format: 'cjs',
   external: externals,            // <─ consolidated list
   sourcemap: false,
   logLevel: 'info',
 });
