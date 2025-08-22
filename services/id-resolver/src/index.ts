import Fastify from 'fastify';
import QRCode from 'qrcode';
import { request } from 'undici';

const server = Fastify({ logger: true });

server.get('/healthz', async () => ({ status: 'ok' }));

server.post('/v1/ids', async (req, reply) => {
	const { gtin, serial, context } = req.body as any;
	if (!gtin) return reply.badRequest('gtin required');
	const path = serial ? `/01/${gtin}/21/${serial}` : `/01/${gtin}`;
	const uri = `${process.env.PUBLIC_SITE_BASE_URL || 'http://localhost:5173'}/scan${path}`;
	return { digitalLinkUri: uri };
});

server.get('/.well-known/digital-link/*', async (req, reply) => {
	const wildcard = (req.params as any)['*'] as string;
	const parts = wildcard.split('/').filter(Boolean);
	const idx = parts.indexOf('01');
	const gtin = idx >= 0 ? parts[idx + 1] : undefined;
	if (!gtin) return reply.notFound('Invalid Digital Link');
	// Resolve via passport-api
	const base = process.env.PASSPORT_API_BASE_URL || 'http://passport-api:8081';
	const res = await request(`${base}/internal/resolve?gtin=${gtin}`);
	if (res.statusCode !== 200) return reply.notFound('Not found');
	const body: any = await res.body.json();
	const publicSite = process.env.PUBLIC_SITE_BASE_URL || 'http://localhost:5173';
	return reply.redirect(302, `${publicSite}/dpp/${body.id}`);
});

server.get('/v1/qr/:id', async (req, reply) => {
	const { id } = req.params as any;
	const publicSite = process.env.PUBLIC_SITE_BASE_URL || 'http://localhost:5173';
	const url = `${publicSite}/dpp/${id}`;
	const png = await QRCode.toBuffer(url, { errorCorrectionLevel: 'M', width: 256 });
	reply.header('Content-Type', 'image/png');
	return reply.send(png);
});

const port = Number(process.env.PORT || 8082);
server.listen({ host: '0.0.0.0', port }).catch((err) => {
	server.log.error(err);
	process.exit(1);
});