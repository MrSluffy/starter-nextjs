import type { GeneratorConfig } from "@/store/generatorStore";
import {
  getPackageManagerInstallCommand,
  getPackageManagerLockFile,
  getPackageManagerScriptCommand,
} from "./shared";

export function buildDockerfile(cfg: GeneratorConfig): string {
  const pm = cfg.packageManager;
  const installCmd = getPackageManagerInstallCommand(pm);
  const buildCmd = getPackageManagerScriptCommand(pm, "build");
  const lockFile = getPackageManagerLockFile(pm);

  return `# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ${lockFile} ./
RUN ${installCmd}

# Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${buildCmd}

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
`;
}

export function buildDockerCompose(cfg: GeneratorConfig): string {
  const services: string[] = [];
  services.push(`  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env`);

  if (cfg.database === "postgresql") {
    services.push(`  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ${cfg.projectName.replace(/-/g, "_")}
    volumes:
      - postgres_data:/var/lib/postgresql/data`);
  }

  if (cfg.database === "mongodb") {
    services.push(`  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo_data:/data/db`);
  }

  const volumes: string[] = [];
  if (cfg.database === "postgresql") volumes.push("  postgres_data:");
  if (cfg.database === "mongodb") volumes.push("  mongo_data:");

  return `services:
${services.join("\n")}
${volumes.length > 0 ? `\nvolumes:\n${volumes.join("\n")}` : ""}
`;
}
