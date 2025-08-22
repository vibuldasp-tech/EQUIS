import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

const server = Fastify({ logger: true });
const prisma = new PrismaClient();

server.get('/healthz', async () => ({ status: 'ok' }));

server.post('/v2/capture', async (req, reply) => {
	const events = Array.isArray((req.body as any)) ? (req.body as any) : [(req.body as any)];
	for (const e of events) {
		const epc: string | undefined = e?.epc || e?.epcs?.[0];
		if (!epc) continue;
		await prisma.epcisEvent.create({ data: { epc, payload: e } });
	}
	return reply.code(202).send({ accepted: events.length });
});

server.get('/v2/events', async (req, reply) => {
	const { epc } = (req.query as any) || {};
	if (!epc) return reply.badRequest('epc required');
	const events = await prisma.epcisEvent.findMany({ where: { epc }, orderBy: { createdAt: 'desc' } });
	return { events };
});

const port = Number(process.env.PORT || 8083);
server.listen({ host: '0.0.0.0', port }).catch((err) => {
	server.log.error(err);
	process.exit(1);
});