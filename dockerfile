FROM --platform=linux/amd64 oven/bun as base

WORKDIR /app
ENV NODE_ENV="production"

FROM --platform=linux/amd64 base as build

COPY --link bun.lock package.json ./
RUN bun install --ci

COPY --link . .

# Build the frontend to generate the dist folder
RUN cd frontend && bun install --ci && bun run build

FROM --platform=linux/amd64 base

COPY --from=build /app /app

# Clean up frontend folder - keep only the built dist folder to reduce image size
RUN cd frontend && \
    rm -rf src node_modules package.json bun.lock *.ts *.js *.json public components.json eslint.config.js README.md .gitignore

EXPOSE 3000

# Make sure app listens on 0.0.0.0 (not just localhost)
ENV HOST=0.0.0.0

CMD ["bun", "run", "start"]

