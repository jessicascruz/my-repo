FROM node:20-alpine as build
ARG env
WORKDIR /app
COPY . .

COPY package.json package.json
RUN yarn install --frozen-lockfile

RUN cp .env .env.local && yarn build;

ENV PORT=8080
ENV HOST=0.0.0.0

CMD ["yarn","start"]