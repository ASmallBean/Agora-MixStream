FROM hub.agoralab.co/agora_public/node:16-alpine

WORKDIR /APP

RUN corepack enable && corepack prepare pnpm@6.22.2 --activate

COPY package.json .
COPY pnpm-*.yaml .

COPY packages/mixstream-api/package.json packages/mixstream-api/package.json
COPY packages/mixstream-shared/package.json packages/mixstream-shared/package.json

RUN pnpm install

COPY packages/mixstream-api/dist/ packages/mixstream-api/dist/
COPY packages/mixstream-shared/lib/ packages/mixstream-shared/lib/

EXPOSE 3030

CMD [ "node", "packages/mixstream-api/dist/main.js" ]
