import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// On Vercel, Nitro builds native Vercel Serverless Functions in .vercel/output.
// Prerendering into .output/public is only needed for static hosting like Firebase.
if (process.env.VERCEL) {
  console.log('--- Detected Vercel Build Environment ---');
  console.log('Skipping Firebase Hosting static prerender (Nitro SSR is handled natively by Vercel).');
  process.exit(0);
}

const ssrPath = path.resolve('.output/server/_ssr/ssr.mjs');
if (!fs.existsSync(ssrPath)) {
  console.log(`[Notice] SSR entry file not found at ${ssrPath}. Skipping static prerender.`);
  process.exit(0);
}

const { default: server } = await import(pathToFileURL(ssrPath).href);

const routes = [
  '/',
  '/products',
  '/products/sue-cat-1',
  '/products/sue-cat-2',
  '/products/sue-cat-3',
  '/products/sue-cat-4',
  '/products/sue-cat-5',
  '/products/sue-cat-6',
  '/products/sue-cat-7',
  '/products/sue-cat-8',
  '/products/sue-cat-9',
  '/about',
  '/contact',
  '/services',
  '/services/consultation',
  '/services/inspection',
  '/services/installation',
  '/services/maintenance',
  '/services/equipment-supply',
  '/industries',
  '/projects',
  '/cart',
  '/checkout',
  '/login',
  '/signup',
  '/admin',
  '/terms',
  '/privacy',
  '/refund-policy',
  '/shipping-policy',
];

const publicDir = path.resolve('.output/public');

async function renderRoute(route) {
  try {
    const req = new Request(`http://localhost${route}`);
    const res = await server.fetch(req, {}, {});
    if (res.status >= 400) {
      console.error(`[ERR ${res.status}] Failed to render ${route}`);
      return;
    }
    const html = await res.text();
    let outPath;
    if (route === '/') {
      outPath = path.join(publicDir, 'index.html');
    } else {
      const routeDir = path.join(publicDir, route.replace(/^\//, ''));
      fs.mkdirSync(routeDir, { recursive: true });
      outPath = path.join(routeDir, 'index.html');
    }
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`[OK 200] ${route.padEnd(30)} -> ${path.relative(publicDir, outPath)} (${html.length} bytes)`);
  } catch (err) {
    console.error(`[EXC] ${route}:`, err.message);
  }
}

async function run() {
  console.log('--- Starting Prerendering for Firebase Hosting ---');
  for (const r of routes) {
    await renderRoute(r);
  }

  // Also render 404.html
  try {
    const req404 = new Request('http://localhost/non-existent-fallback-route-404');
    const res404 = await server.fetch(req404, {}, {});
    const html404 = await res404.text();
    fs.writeFileSync(path.join(publicDir, '404.html'), html404, 'utf8');
    console.log(`[OK 404] 404.html created (${html404.length} bytes)`);
  } catch (err) {
    console.error('[EXC 404]:', err.message);
  }

  console.log('--- Prerendering Finished Successfully! ---');
}

run();
