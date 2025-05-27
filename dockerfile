FROM --platform=linux/amd64 oven/bun as base

WORKDIR /app
ENV NODE_ENV="production"

FROM --platform=linux/amd64 base as build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    pkg-config \
    python3 \
    python3-pip

COPY --link bun.lock package.json ./
RUN bun install --ci

COPY --link . .

# Build the frontend to generate the dist folder
RUN cd frontend && bun install --ci && bun run build

FROM --platform=linux/amd64 base

COPY --from=build /app /app

EXPOSE 3000

# Make sure app listens on 0.0.0.0 (not just localhost)
ENV HOST=0.0.0.0

CMD ["bun", "run", "start"]

