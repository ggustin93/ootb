import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import type { AstroIntegration } from 'astro';
import react from '@astrojs/react';
import astrowind from './vendor/integration';
import { readingTimeRemarkPlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hasExternalScripts = true;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) => 
 hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
 output: 'static',
 build: {
   inlineStylesheets: 'auto',
 },
 experimental: {
   clientPrerender: true
 },
 /*redirects: {
   '/admin': '/admin/index.html'
 },*/
 integrations: [
   sitemap(),
   tailwind({
     applyBaseStyles: false,
   }),
   mdx({
    extendMarkdownConfig: true,
    optimize: false,
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    },
    remarkPlugins: [
      readingTimeRemarkPlugin
    ],
    rehypePlugins: [
      lazyImagesRehypePlugin
    ]
  }),
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
       config: { 
         forward: ['dataLayer.push'],
         resolveUrl: (url) => {
           // Rediriger les requêtes Umami vers leur domaine d'origine
           if (url.hostname === 'cloud.umami.is') {
             return url;
           }
         },
       },
     })
   ),
   astrowind({
     config: './src/config.yaml',
   }),
 ],
 image: {
   domains: [
     'cdn.pixabay.com', 
     'image.ausha.co',  
     'images.unsplash.com',
     'res.cloudinary.com',
     // Domaines S3 de NocoDB
     'nocohub-001-prod-app-attachments.s3.us-east-2.amazonaws.com',
     's3.us-east-2.amazonaws.com',
     's3.amazonaws.com'
   ],
   service: {
     entrypoint: 'astro/assets/services/sharp',
     config: {
       quality: 75,
       format: ['webp', 'jpeg'],
       cacheDir: './.cache/image',
     },
   },
 },
 vite: {
   resolve: {
     alias: {
       '~': path.resolve(__dirname, './src'),
     },
     conditions: ['astro']
   },
   optimizeDeps: {
     exclude: ['astro:*'],
     include: ['react', 'react-dom']
   },
   build: {
     assetsInlineLimit: 4096,
     modulePreload: false,
     cssCodeSplit: true,
     minify: 'terser',
     terserOptions: {
       compress: {
         drop_console: true,
         drop_debugger: true,
       },
     },
     rollupOptions: {
       external: [
         'astro:*'
       ],
       output: {
         format: 'esm',
         chunkFileNames: 'chunks/[name].[hash].mjs',
         entryFileNames: 'entries/[name].[hash].mjs',
         manualChunks: (id) => {
           if (id.includes('./src/components/common/YouTubePlayer.astro')) return 'youtube-api';
           if (id.includes('node_modules/@astrojs')) return 'astro-vendor';
           if (id.includes('node_modules/')) return 'vendor';
           return null;
         }
       }
     }
   },
   ssr: {
     noExternal: ['@astrojs/*'],
     target: 'node'
   },
   assetsInclude: ['**/*.otf', '**/*.ttf', '**/*.woff', '**/*.woff2'],
   publicDir: 'public',
 },
});