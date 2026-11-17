# syntax=docker/dockerfile:1.7

# One Node version for the image build and for CI.
ARG NODE_VERSION=24

# --------------------------------------------------------------------- build
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./

# `extra_ca` is optional, and only for building behind something that re-signs
# HTTPS (a corporate proxy, or an antivirus that scans TLS). Without its root
# certificate npm rejects every download. CI does not need it. It is mounted for
# this one command and ends up in no layer. `npm run docker:build` passes it.
RUN --mount=type=secret,id=extra_ca     --mount=type=cache,target=/root/.npm     if [ -s /run/secrets/extra_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; fi;     npm ci

COPY . .
RUN npm run build

# ------------------------------------------------------------------- runtime
# Static files only: no Node at runtime. The unprivileged image runs as uid 101
# and listens on 8080, so the pod can drop every capability.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
# /config.js is replaced at deploy time by the Helm ConfigMap: one image, any environment.
