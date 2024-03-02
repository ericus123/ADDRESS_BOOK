FROM node:16.20.1

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json .

RUN yarn global add @nestjs/cli

RUN yarn install

RUN yarn build

COPY . .


EXPOSE 3001

CMD ["yarn", "start"]