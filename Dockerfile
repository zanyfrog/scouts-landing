FROM node:20-alpine

WORKDIR /app

COPY scouts-landing/package.json ./package.json
COPY scouts-landing/index.html ./index.html
COPY scouts-landing/styles.css ./styles.css
COPY scouts-landing/app.js ./app.js
COPY scouts-landing/server.js ./server.js
COPY scouts-landing/assets ./assets
COPY scouts-landing/resources ./resources
COPY scouts.orm /scouts.orm

ENV PORT=4173
ENV ORM_BASE_URL=http://scouts-orm:4174
ENV AUTH_BASE_URL=http://scouts-i-am:3000

EXPOSE 4173

RUN chown -R node:node /app /scouts.orm

USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 4173) + '/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
