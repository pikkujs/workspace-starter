import { APIGatewayProxyEvent } from 'aws-lambda'
import {
  corsHTTP,
  corslessHTTP,
} from '@pikku/lambda/http'
import {
  createSessionServices,
} from '@pikku-workspace-starter/functions/src/services'

import '@pikku-workspace-starter/functions/.pikku/pikku-schemas/register.gen'
import '@pikku-workspace-starter/functions/.pikku/pikku-routes.gen'
import { coldStart } from './cold-start.js'

export const corslessHandler = async (event: APIGatewayProxyEvent) => {
  const singletonServices = await coldStart()
  return await corslessHTTP(
    event,
    singletonServices,
    createSessionServices
  )
}

export const corsHandler = async (event: APIGatewayProxyEvent) => {
  const singletonServices = await coldStart()
  return await corsHTTP(
    event,
    [],
    singletonServices,
    createSessionServices
  )
}
