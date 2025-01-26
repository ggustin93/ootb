import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';
import react from '@astrojs/react';
import astrowind from './vendor/integration';
import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) => 
 hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
 output: 'static',
 build: {
   inlineStylesheets: 'auto',
   rollupOptions: {
     external: ['@astrojs/core']
   }
 },
 experimental: {
   clientPrerender: true
 },
 viewTransitions: true,
 integrations: [
   tailwind({
     applyBaseStyles: false,
   }),
   mdx(),
   react(),
   {
     name: 'font-assets',
     hooks: {
       'astro:config:setup': ({ updateConfig }) => {
         updateConfig({
           vite: {
             assetsInclude: ['**/*.otf', '**/*.ttf', '**/*.woff', '**/*.woff2'],
             build: {
               assetsInlineLimit: 0,
             },
           },
         });
       },
     },
   },
   icon({
     include: {
       tabler: ['*'],
       'flat-color-icons': [
         'template',
         'gallery',
         'approval',
         'document',
         'advertising',
         'currency-exchange',
         'voice-presentation',
         'business-contact',
         'database',
       ],
     },
   }),
   ...whenExternalScripts(() =>
     partytown({
       config: { forward: ['dataLayer.push'] },
     })
   ),
   compress({
     CSS: true,
     HTML: {
       'html-minifier-terser': {
         removeAttributeQuotes: false,
       },
     },
     Image: false,
     JavaScript: true,
     SVG: false,
     Logger: 1,
   }),
   astrowind({
     config: './src/config.yaml',
   }),
 ],
 image: {
   domains: ['cdn.pixabay.com'],
 },
 markdown: {
   remarkPlugins: [readingTimeRemarkPlugin],
   rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
 },
 vite: {
   resolve: {
     alias: {
       '~': path.resolve(__dirname, './src'),
     },
     conditions: ['astro']
   },
   optimizeDeps: {
     exclude: ['astro:*']
   },
   build: {
     assetsInlineLimit: 4096,
     modulePreload: false,
     rollupOptions: {
       external: [
         'astro:*'
       ],
       output: {
         format: 'esm',
         chunkFileNames: 'chunks/[name].[hash].mjs',
         entryFileNames: 'entries/[name].[hash].mjs'
       }
     }
   },
   ssr: {
     noExternal: ['@astrojs/*'],
     target: 'node'
   },
   assetsInclude: ['**/*.otf', '**/*.ttf', '**/*.woff', '**/*.woff2'],
   publicDir: 'src/assets',
 },
});