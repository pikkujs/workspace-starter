import type { ChannelConnection, ChannelDisconnection, ChannelMessage } from '../../../.vramework/vramework-types.js'

export const onConnect: ChannelConnection<'hello!'> = async (services, channel) => {
    services.logger.info(`Connected to event channel with opening data ${JSON.stringify(channel.openingData)}`)
    channel.send('hello!')
}

export const onDisconnect: ChannelDisconnection = async (services, channel) => {
    services.logger.info(`Disconnected from event channel with data ${JSON.stringify(channel.openingData)}`)
}

export const authenticate: ChannelMessage<{ token: string, userId: string }, { authResult: boolean, action: 'auth' }> = async (services, channel, data) => {
    const authResult = data.token === 'valid'
    if (authResult) {
        await channel.setUserSession({ userId: data.userId })
    }
    return { authResult, action: 'auth' }
}

export const subscribe: ChannelMessage<{ name: string }> = async (services, channel, data) => {
    await services.eventHub.subscribe(data.name, channel.channelId)
}

export const unsubscribe: ChannelMessage<{ name: string }> = async (services, channel, data) => {
    await services.eventHub.unsubscribe(data.name, channel.channelId)
}

export const emitMessage: ChannelMessage<{ name: string }, { timestamp: string, from: string } | { message: string }> = async (services, channel, data) => {
    await services.eventHub.publish(data.name, channel.channelId, { timestamp: new Date().toISOString(), from: channel.userSession?.userId ?? 'anonymous' })
}

export const onMessage: ChannelMessage<'hello', 'hey'> = async (services, channel) => {
    services.logger.info(`Got a generic hello message with data ${JSON.stringify(channel.openingData)}`)
    channel.send('hey')
}
