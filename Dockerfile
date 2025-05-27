# Sử dụng Node.js LTS version làm base image
FROM node:18-alpine

LABEL maintainer="your-email@example.com"
LABEL version="1.0"

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /usr/src/app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "server.js"]