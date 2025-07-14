FROM node:24-alpine

WORKDIR /app

COPY package*.json tsconfig.json nodemon.json ./
RUN npm install

COPY . .

RUN npm run build

RUN chmod +x entrypoint.sh
RUN chmod +x entrypoint.prod.sh

EXPOSE 3333

CMD ["/bin/sh", "./entrypoint.prod.sh"] 