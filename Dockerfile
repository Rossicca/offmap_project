FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public ./public
COPY scripts ./scripts
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787
WORKDIR /app

COPY package.json ./
COPY server ./server
COPY --from=build /app/dist ./dist

EXPOSE 8787
CMD ["npm", "start"]
