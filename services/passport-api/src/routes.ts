import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { profiles, validateDpp } from '@dpp/schemas';
import { getEvidenceSignedUrl } from './s3';

function computePublicView(payload: any) {
	const visibility = payload.visibility || { publicFields: [], restrictedFields: [] };
	const result: Record<string, any> = {};
	for (const field of visibility.publicFields) {
		if (payload[field] !== undefined) result[field] = payload[field];
	}
	// Always include identifier.digitalLinkUri in public
	result.identifier = result.identifier || {};
	result.identifier.digitalLinkUri = payload.identifier?.digitalLinkUri;
	return result;
}

function computeETag(obj: any) {
	const json = JSON.stringify(obj);
	return 'W/"' + crypto.createHash('sha256').update(json).digest('hex') + '"';
}

export async function registerRoutes(app: FastifyInstance, prisma: PrismaClient) {
	app.post('/v1/validate', async (req, reply) => {
		const body = req.body;
		const res = validateDpp(body);
		return reply.code(res.valid ? 200 : 400).send(res);
	});

	app.post('/v1/dpp', { preHandler: [app.authenticate?.bind(app) as any].filter(Boolean) }, async (req, reply) => {
		const body: any = req.body;
		const val = validateDpp(body);
		if (!val.valid) return reply.code(400).send(val);

		const item = await prisma.dppItem.create({
			data: {
				title: body.title,
				brand: body.brand,
				unit: body.unit || 'variant',
				identifierGtin: body.identifier.gtin || null,
				identifierSku: body.identifier.sku || null,
				digitalLinkUri: body.identifier.digitalLinkUri,
				data: body,
				visibility: body.visibility
			}
		});
		await prisma.version.create({
			data: { number: 1, diff: body, createdBy: 'manual', dppItemId: item.id }
		});
		return reply.code(201).send({ id: item.id });
	});

	app.put('/v1/dpp/:id', { preHandler: [app.authenticate?.bind(app) as any].filter(Boolean) }, async (req, reply) => {
		const id = (req.params as any).id;
		const body: any = req.body;
		const val = validateDpp(body);
		if (!val.valid) return reply.code(400).send(val);
		const existing = await prisma.dppItem.findUnique({ where: { id } });
		if (!existing) return reply.notFound('DPP not found');
		const updated = await prisma.dppItem.update({ where: { id }, data: { data: body, title: body.title, brand: body.brand, visibility: body.visibility, digitalLinkUri: body.identifier.digitalLinkUri, identifierGtin: body.identifier.gtin || null, identifierSku: body.identifier.sku || null } });
		const nextNum = (await prisma.version.count({ where: { dppItemId: id } })) + 1;
		await prisma.version.create({ data: { number: nextNum, diff: body, createdBy: 'manual', dppItemId: id } });
		return reply.send({ id: updated.id, version: nextNum });
	});

	app.get('/v1/dpp/:id', { preHandler: [app.authenticate?.bind(app) as any].filter(Boolean) }, async (req, reply) => {
		const id = (req.params as any).id;
		const item = await prisma.dppItem.findUnique({ where: { id } });
		if (!item) return reply.notFound('DPP not found');
		return reply.send(item);
	});

	app.get('/v1/dpp/:id/public', async (req, reply) => {
		const id = (req.params as any).id;
		const item = await prisma.dppItem.findUnique({ where: { id } });
		if (!item) return reply.notFound('DPP not found');
		const publicJson = computePublicView(item.data);
		const tag = computeETag(publicJson);
		reply.header('ETag', tag);
		return reply.send(publicJson);
	});

	app.get('/v1/dpp/:id/versions', { preHandler: [app.authenticate?.bind(app) as any].filter(Boolean) }, async (req, reply) => {
		const id = (req.params as any).id;
		const versions = await prisma.version.findMany({ where: { dppItemId: id }, orderBy: { number: 'asc' } });
		return reply.send(versions.map(v => ({ number: v.number, createdBy: v.createdBy, createdAt: v.createdAt })));
	});

	app.get('/v1/dpp/:id/versions/:n', { preHandler: [app.authenticate?.bind(app) as any].filter(Boolean) }, async (req, reply) => {
		const { id, n } = req.params as any;
		const version = await prisma.version.findFirst({ where: { dppItemId: id, number: Number(n) } });
		if (!version) return reply.notFound('Version not found');
		return reply.send(version);
	});

	app.post('/v1/dpp/:id/evidence', { preHandler: [app.authenticate?.bind(app) as any].filter(Boolean) }, async (req, reply) => {
		const id = (req.params as any).id;
		const { filename, contentType } = req.body as any;
		if (!filename || !contentType) return reply.badRequest('filename and contentType required');
		const { url, key } = await getEvidenceSignedUrl(filename, contentType);
		return reply.send({ uploadUrl: url, key });
	});

	app.decorate('authenticate', async function (this: any, request: any, reply: any) {
		try { await request.jwtVerify(); } catch (err) { return reply.code(401).send({ message: 'unauthorized' }); }
	});
}