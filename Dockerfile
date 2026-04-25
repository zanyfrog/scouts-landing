FROM node:20-alpine

WORKDIR /app

COPY scouts-landing/package.json ./package.json
COPY scouts-landing/index.html ./index.html
COPY scouts-landing/styles.css ./styles.css
COPY scouts-landing/app.js ./app.js
COPY scouts-landing/server.js ./server.js
COPY scouts-landing/data ./data
COPY scouts.orm /scouts.orm

ENV PORT=4173
ENV ORM_BASE_URL=http://scouts-orm:4174

EXPOSE 4173

CMD ["node", "server.js"]
