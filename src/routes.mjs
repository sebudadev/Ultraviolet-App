import { readFileSync } from 'node:fs';

const pages = {
  index: 'index.html',
  'manifest.json': 'manifest.json',
  '404': '404.html',
  // Add more static routes as needed:
  search: 'search.html',
  // Example:
  // docs: 'docs.html',
  // games: 'games.html',
};

const externalPages = {
  github: {
    default: 'https://github.com/titaniumnetwork-dev/Ultraviolet-App',
  },
};

const text404 = '<h1>404 Not Found</h1>';

export default {
  pages,
  externalPages,
  text404,
};