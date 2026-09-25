FROM node:24-alpine

WORKDIR /app

# Keep dependency installation in its own layer so source-only changes reuse it.
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Run the application as an unprivileged user.
RUN addgroup -S app && adduser -S -G app -u 10001 app
COPY --chown=app:app server.js ./

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/health').then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
