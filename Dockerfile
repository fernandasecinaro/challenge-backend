#
# Builder stage.
#
FROM node:16 AS builder

WORKDIR /usr/src/app

COPY ./package*.json ./
COPY ./tsconfig*.json ./
COPY ./src ./src
COPY ./prisma ./prisma

RUN npm i --quiet 
RUN npm run prisma:generate
RUN npm run build

#
# Production stage.
#
FROM node:16-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80

COPY package*.json ./

RUN npm i --quiet --only=production --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

RUN npm run prisma:generate

EXPOSE 80 

CMD [ "npm", "run", "start" ]
