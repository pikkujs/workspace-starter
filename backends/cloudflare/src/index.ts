import { runFetch, runScheduled } from '@vramework/cloudflare';
import { createSessionServices } from '@vramework-workspace-starter/functions/src/services';
import { setupServices } from './setup-services';
import { ExportedHandler, Response } from '@cloudflare/workers-types';

import '@vramework-workspace-starter/functions/.vramework/vramework-bootstrap';

export { WebSocketHibernationServer } from './websocket-hibernation-server';

export default {
	async scheduled(controller, env) {
		const singletonServices = await setupServices(env);
		await runScheduled(controller, singletonServices);
	},

	async fetch(request, env): Promise<Response> {
		const singletonServices = await setupServices(env);
		const websocketServerDurableObject: any = singletonServices.variablesService.get('WEBSOCKET_HIBERNATION_SERVER');
		const id = websocketServerDurableObject.idFromName('channel-name-goes-here')
		const webSocketHibernationServer = websocketServerDurableObject.get(id);
		return await runFetch(request, singletonServices, createSessionServices, webSocketHibernationServer);
	},
} satisfies ExportedHandler<Record<string, string>>;
