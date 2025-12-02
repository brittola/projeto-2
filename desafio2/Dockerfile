FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install --production

COPY app.js .

ENTRYPOINT ["node", "app.js"]
CMD ["select"]
