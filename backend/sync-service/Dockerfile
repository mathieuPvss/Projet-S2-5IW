FROM node:24-alpine

WORKDIR /app

COPY package*.json tsconfig.json nodemon.json ./
RUN npm install

COPY src/ ./src/
# RUN npm run build

# Exposition du port des métriques
EXPOSE 3333

ENTRYPOINT ["npm", "run", "dev"]