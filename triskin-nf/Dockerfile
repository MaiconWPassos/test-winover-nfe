# Astro SSR (middleware + cookies). PUBLIC_API_URL: URL da API como o navegador acessa.
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
# npm install: lock pode ficar atrás do package.json; @astrojs/node 10 exige astro ^6 (v9 pedia astro 5).
RUN npm install --no-audit --no-fund

COPY . .

ARG PUBLIC_API_URL=http://localhost:3000
ENV PUBLIC_API_URL=${PUBLIC_API_URL}

RUN npm run build

FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
