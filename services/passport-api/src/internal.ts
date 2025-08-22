import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function registerInternal(app: FastifyInstance, prisma: PrismaClient) {
	app.get('/internal/resolve', async (req, reply) => {
		const { gtin, sku } = (req.query as any) || {};
		if (!gtin && !sku) return reply.badRequest('gtin or sku required');
		const item = await prisma.dppItem.findFirst({ where: { OR: [{ identifierGtin: gtin || undefined }, { identifierSku: sku || undefined }] } });
		if (!item) return reply.notFound('Not found');
		return reply.send({ id: item.id });
	});
}