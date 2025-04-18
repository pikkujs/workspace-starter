FROM node:20

WORKDIR /app

ENV NODE_ENV=production
ENV POSTGRES_CREDENTIALS='{"host":"localhost","port":5432,"user":"postgres","password":"password","database":"pikku_workspace_starter"}'

COPY .yarnrc.yml .yarnrc.yml
COPY .yarn/install-state.gz .yarn/install-state.gz

COPY package.json package.json
COPY yarn.lock yarn.lock

COPY tsconfig.json tsconfig.json
COPY backends/ws/ backends/ws/
COPY packages/functions/ packages/functions/
# This verifies generated functions are copied to the Docker image
COPY packages/functions/.pikku/ packages/functions/.pikku/
COPY packages/sdk/ packages/sdk/

RUN corepack enable
RUN cd backends/ws && yarn workspaces focus --production

WORKDIR backends/ws

CMD ["yarn", "start"]