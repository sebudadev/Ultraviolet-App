import Fastify from 'fastify';
import { createServer } from 'node:http';
import wisp from 'wisp-server-node';
import createRammerhead from '../lib/rammerhead/src/server/index.js';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { bareModulePath } from '@mercuryworkshop/bare-as-module3';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import pageRoutes from './routes.mjs';
import {
  config,
  paintSource,
  randomizeGlobal,
  preloaded404,
  tryReadFile,
} from './randomization.mjs';
import loadTemplates from './templates.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync, unlinkSync } from 'node:fs';
import ecosystem from '../ecosystem.config.js';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');
const uvDir = join(publicDir, 'uv');

const ecosystemConfig = Object.freeze(
    ecosystem.apps.find((app) => app.name === 'HolyUB') || ecosystem.apps[0]
  ),
  { pages, externalPages, cacheBustList } = pageRoutes;

/* Record the server's location as a URL object, including its host and port.
 * The host can be modified at /src/config.json, whereas the ports can be modified
 * at /ecosystem.config.js.
 */
const serverUrl = ((base) => {
  try {
    base = new URL(config.host);
  } catch (e) {
    base = new URL('http://a');
    base.host = config.host;
  }
  base.port =
    ecosystemConfig[config.production ? 'env_production' : 'env'].PORT;
  return Object.freeze(base);
})();
console.log(serverUrl);

// The server will check for the existence of this file when a shutdown is requested.
// The shutdown script in run-command.js will temporarily produce this file.
const shutdown = fileURLToPath(new URL('./.shutdown', import.meta.url));

const rh = createRammerhead();
const rammerheadScopes = [
  '/rammerhead.js',
  '/hammerhead.js',
  '/transport-worker.js',
  '/task.js',
  '/iframe-task.js',
  '/worker-hammerhead.js',
  '/messaging',
  '/sessionexists',
  '/deletesession',
  '/newsession',
  '/editsession',
  '/needpassword',
  '/syncLocalStorage',
  '/api/shuffleDict',
  '/mainport',
];

const rammerheadSession = /^\/[a-z0-9]{32}/,
  shouldRouteRh = (req) => {
    try {
      const url = new URL(req.url, serverUrl);
      return (
        rammerheadScopes.includes(url.pathname) ||
        rammerheadSession.test(url.pathname)
      );
    } catch (e) {
      return false;
    }
  },
  routeRhRequest = (req, res) => {
    rh.emit('request', req, res);
  },
  routeRhUpgrade = (req, socket, head) => {
    rh.emit('upgrade', req, socket, head);
  };

// Create a server factory for RH, and wisp (and bare if you please).
const serverFactory = (handler) => {
  return createServer()
    .on('request', (req, res) => {
      if (shouldRouteRh(req)) routeRhRequest(req, res);
      else handler(req, res);
    })
    .on('upgrade', (req, socket, head) => {
      if (shouldRouteRh(req)) routeRhUpgrade(req, socket, head);
      else if (req.url.endsWith('/wisp/')) wisp.routeRequest(req, socket, head);
    });
};

// Set logger to true for logs.
const app = Fastify({
  ignoreDuplicateSlashes: true,
  ignoreTrailingSlash: true,
  logger: false,
  serverFactory: serverFactory,
});

// Apply Helmet middleware for security.
app.register(fastifyHelmet, {
  contentSecurityPolicy: false, // Disable CSP
  xPoweredBy: false,
});

// Assign server file paths to different paths, for serving content on the website.
app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../views/pages', import.meta.url)),
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../views/assets', import.meta.url)),
  prefix: '/assets/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../views/archive', import.meta.url)),
  prefix: '/archive/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch', import.meta.url)
  ),
  prefix: '/serving/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch/cores', import.meta.url)
  ),
  prefix: '/cores/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch/info', import.meta.url)
  ),
  prefix: '/info/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch/cores', import.meta.url)
  ),
  prefix: '/uauth/',
  decorateReply: false,
});

// You should NEVER commit roms, due to piracy concerns.
app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL('../views/archive/gfiles/rarch/roms', import.meta.url)
  ),
  prefix: '/roms/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL(
      // Use the pre-compiled, minified scripts instead, if enabled in config.
      config.minifyScripts ? '../views/dist/assets/js' : '../views/assets/js',
      import.meta.url
    )
  ),
  prefix: '/assets/js/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL(
      // Use the pre-compiled, minified stylesheets instead, if enabled in config.
      config.minifyScripts ? '../views/dist/assets/css' : '../views/assets/css',
      import.meta.url
    )
  ),
  prefix: '/assets/css/',
  decorateReply: false,
});

// This combines scripts from the official UV repository with local UV scripts into
// one directory path. Local versions of files override the official versions.
app.register(fastifyStatic, {
  root: [
    fileURLToPath(
      new URL(
        // Use the pre-compiled, minified scripts instead, if enabled in config.
        config.minifyScripts ? '../views/dist/uv' : '../views/uv',
        import.meta.url
      )
    ),
    uvPath,
  ],
  prefix: '/uv/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: fileURLToPath(
    new URL(
      // Use the pre-compiled, minified scripts instead, if enabled in config.
      config.minifyScripts ? '../views/dist/scram' : '../views/scram',
      import.meta.url
    )
  ),
  prefix: '/scram/',
  decorateReply: false,
});

// Register proxy paths to the website.
app.register(fastifyStatic, {
  root: epoxyPath,
  prefix: '/epoxy/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: libcurlPath,
  prefix: '/libcurl/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: bareModulePath,
  prefix: '/bareasmodule/',
  decorateReply: false,
});

app.register(fastifyStatic, {
  root: baremuxPath,
  prefix: '/baremux/',
  decorateReply: false,
});

/* If you are trying to add pages or assets in the root folder and
 * NOT entire folders, check ./src/routes.mjs and add it manually.
 *
 * All website files are stored in the /views directory.
 * This takes one of those files and displays it for a site visitor.
 * Paths like /browsing are converted into paths like /views/pages/surf.html
 * back here. Which path converts to what is defined in routes.mjs.
 */
app.get('/:path', (req, reply) => {
  // Testing for future features that need cookies to deliver alternate source files.
  if (req.raw.rawHeaders.includes('Cookie'))
    console.log(req.raw.rawHeaders[req.raw.rawHeaders.indexOf('Cookie') + 1]);

  const reqPath = req.params.path;

  if (reqPath in externalPages) {
    let externalRoute = externalPages[reqPath];
    if (typeof externalRoute !== 'string')
      externalRoute = externalRoute.default;
    return reply.redirect(externalRoute);
  }

  // If a GET request is sent to /test-shutdown and a script-generated shutdown file
  // is present, gracefully shut the server down.
  if (reqPath === 'test-shutdown' && existsSync(shutdown)) {
    console.log('sebudaca is shutting down.');
    app.close();
    unlinkSync(shutdown);
    process.exitCode = 0;
  }

  // Return the error page if the query is not found in routes.mjs.
  if (reqPath && !(reqPath in pages))
    return reply.code(404).type('text/html').send(preloaded404);

  // Set the index the as the default page. Serve as an html file by default.
  const fileName = reqPath ? pages[reqPath] : pages.index,
    supportedTypes = {
      default: 'text/html',
      html: 'text/html',
      txt: 'text/plain',
      xml: 'application/xml',
      ico: 'image/vnd.microsoft.icon',
    },
    type =
      supportedTypes[fileName.slice(fileName.lastIndexOf('.') + 1)] ||
      supportedTypes.default;

  reply.type(type);
  if (type === supportedTypes.default)
    reply.send(
      paintSource(
        loadTemplates(tryReadFile('../views/' + fileName, import.meta.url))
      )
    );
  else reply.send(tryReadFile('../views/' + fileName, import.meta.url));
});

app.get('/github/:redirect', (req, reply) => {
  if (req.params.redirect in externalPages.github)
    reply.redirect(externalPages.github[req.params.redirect]);
  else reply.code(404).type('text/html').send(preloaded404);
});

app.get('/assets/js/' + cacheBustList['common.js'], (req, reply) => {
  reply
    .type('text/javascript')
    .send(
      randomizeGlobal(
        '../views' + (config.minifyScripts ? '/dist' : '') + req.url
      )
    );
});

app.get('/uv/:file.js', (req, reply) => {
  const destination = existsSync(
    fileURLToPath(new URL('../views' + req.url, import.meta.url))
  )
    ? '../views' + (config.minifyScripts ? '/dist' : '') + req.url
    : pathToFileURL(uvPath) + `/${req.params.file}.js`;
  reply
    .type('text/javascript')
    .send(
      randomizeGlobal(destination).replace(
        /(["'`])\{\{ultraviolet-error\}\}\1/g,
        JSON.stringify(
          tryReadFile('../views/' + pages['uverror'], import.meta.url)
        )
      )
    );
});

// Set an error page for invalid paths outside the query string system.
app.setNotFoundHandler((req, reply) => {
  reply.code(404).type('text/html').send(preloaded404);
});

// Serve static files (HTML, CSS, JS, images, etc.)
app.register(fastifyStatic, {
  root: publicDir,
  prefix: '/',
  decorateReply: false,
});

// Serve UV assets from /uv/
app.register(fastifyStatic, {
  root: uvDir,
  prefix: '/uv/',
  decorateReply: false,
});

// 404 handler for missing files
app.setNotFoundHandler((req, reply) => {
  // Try to serve your custom 404.html if it exists
  const notFoundPath = join(publicDir, '404.html');
  if (existsSync(notFoundPath)) {
    reply.code(404).type('text/html').sendFile('404.html');
  } else {
    reply.code(404).type('text/plain').send('404 Not Found');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Ultraviolet server running at ${address}`);
});