// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://andriibogdanov.github.io',
  output: 'static',
  compressHTML: true,
  build: {
    // одна страница = один запрос: без отдельного запроса за CSS
    inlineStylesheets: 'always',
  },
  devToolbar: { enabled: false },
});
