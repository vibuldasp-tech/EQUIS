import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import etag from '@fastify/etag';
import jwtPlugin from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import { registerRoutes } from './routes';
import { registerInternal } from './internal';

const server = Fastify({ logger: true });
const prisma = new PrismaClient();

server.register(cors, { origin: true });
server.register(sensible);
server.register(etag);
server.register(rateLimit, { max: 100, timeWindow: '1 minute' });
server.register(jwtPlugin, { secret: process.env.JWT_SECRET || 'dev-secret' });

server.get('/healthz', async () => ({ status: 'ok' }));
server.get('/readyz', async () => ({ status: 'ready' }));

registerRoutes(server, prisma).catch((err) => {
	server.log.error(err);
	process.exit(1);
});
registerInternal(server, prisma).catch((err) => {
	server.log.error(err);
	process.exit(1);
});

const port = Number(process.env.PORT || 8081);
server.listen({ host: '0.0.0.0', port }).catch((err) => {
	server.log.error(err);
	process.exit(1);
});