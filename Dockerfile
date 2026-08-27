FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

COPY .yarn ./.yarn

RUN yarn install --immutable

COPY . .

RUN mkdir -p /app/data && chown -R node:node /app

USER node

CMD ["yarn", "start"]