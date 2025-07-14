FROM ghcr.io/puppeteer/puppeteer:24.8.2

WORKDIR /app

COPY package*.json ./

USER root

RUN npm install

COPY . .

USER pptruser

CMD ["npm", "run", "start"]