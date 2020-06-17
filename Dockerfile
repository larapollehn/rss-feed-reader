FROM alpine:node

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "run", "start"]