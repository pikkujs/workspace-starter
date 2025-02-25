import { APIGatewayEvent, APIGatewayProxyHandler } from 'aws-lambda'

import {
  connectWebsocket,
  disconnectWebsocket,
  LambdaEventHubService,
  processWebsocketMessage,
} from '@pikku/lambda/websocket'

import { createConfig } from '@pikku-workspace-starter/functions/src/config'
import { createSingletonServices } from '@pikku-workspace-starter/functions/src/services'

import {
  Config,
  SingletonServices,
} from '@pikku-workspace-starter/functions/src/application-types'

import { AWSSecrets } from '@pikku/aws-services'

import '@pikku-workspace-starter/functions/.pikku/pikku-channels'
import { KyselyChannelStore } from './kysely-channel-store.js'
import { ChannelStore } from '@pikku/core/channel'
import { KyselyEventHubStore } from './kysely-subscription-store.js'
import { MakeRequired } from '@pikku/core'
import { LocalVariablesService } from '@pikku/core/services'

let state:
  | {
      config: Config
      singletonServices: MakeRequired<SingletonServices, 'eventHub'>
      channelStore: ChannelStore
    }
  | undefined

const getParams = async (event: APIGatewayEvent) => {
  if (!state) {
    const config = await createConfig()
    const variablesService = new LocalVariablesService()
    const singletonServices = await createSingletonServices(
      config,
      {
        variablesService,
        secretServce: new AWSSecrets(config),
      }
    )
    const channelStore = new KyselyChannelStore(singletonServices.kysely)
    const eventHubStore = new KyselyEventHubStore(singletonServices.kysely)
    singletonServices.eventHub = new LambdaEventHubService(
      singletonServices.logger,
      event,
      channelStore,
      eventHubStore
    )
    state = {
      config,
      singletonServices: singletonServices as MakeRequired<
        typeof singletonServices,
        'eventHub'
      >,
      channelStore,
    }
  }
  return state
}

export const connectHandler: APIGatewayProxyHandler = async (event) => {
  const params = await getParams(event)
  await connectWebsocket(event, params)
  return { statusCode: 200, body: '' }
}

export const disconnectHandler: APIGatewayProxyHandler = async (event) => {
  const params = await getParams(event)
  return await disconnectWebsocket(event, params)
}

export const defaultHandler: APIGatewayProxyHandler = async (event) => {
  const params = await getParams(event)
  return await processWebsocketMessage(event, params)
}
