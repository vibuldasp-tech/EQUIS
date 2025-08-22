import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const items = [
	{ title: 'Eco Tee', brand: 'EcoBrand', sku: 'TEE-001', gtin: '00012345600012', comp: [{ material: 'Cotton', percentage: 80 }, { material: 'Recycled Polyester', percentage: 20, recycled: true, recycledContentPct: 20 }], care: 'Wash cold', eol: 'Donate or recycle', cert: { scheme: 'OEKO-TEX', id: 'OTX-1001', validUntil: '2030-12-31' } },
	{ title: 'Denim Classic', brand: 'DenimCo', sku: 'DEN-100', gtin: '00012345600013', comp: [{ material: 'Cotton', percentage: 98 }, { material: 'Elastane', percentage: 2 }], care: 'Wash cold, inside out', eol: 'Repair then recycle', cert: { scheme: 'GOTS', id: 'GOTS-2001', validUntil: '2030-12-31' } },
	{ title: 'Knit Sweater', brand: 'WarmWear', sku: 'KNI-010', gtin: '00012345600014', comp: [{ material: 'Wool', percentage: 70 }, { material: 'Recycled Nylon', percentage: 30, recycled: true, recycledContentPct: 30 }], care: 'Hand wash', eol: 'Repair or donate', cert: { scheme: 'RWS', id: 'RWS-3001', validUntil: '2030-12-31' } },
	{ title: 'Active Leggings', brand: 'Move', sku: 'LEG-500', gtin: '00012345600015', comp: [{ material: 'Polyester', percentage: 85 }, { material: 'Elastane', percentage: 15 }], care: 'Delicate wash', eol: 'Recycle', cert: { scheme: 'BlueSign', id: 'BS-4001', validUntil: '2030-12-31' } },
	{ title: 'Hoodie', brand: 'Cozy', sku: 'HOO-220', gtin: '00012345600016', comp: [{ material: 'Cotton', percentage: 60 }, { material: 'Recycled Polyester', percentage: 40, recycled: true, recycledContentPct: 40 }], care: 'Wash warm', eol: 'Donate', cert: { scheme: 'OEKO-TEX', id: 'OTX-1002', validUntil: '2030-12-31' } },
	{ title: 'Socks', brand: 'Daily', sku: 'SOC-020', gtin: '00012345600017', comp: [{ material: 'Cotton', percentage: 75 }, { material: 'Polyamide', percentage: 23 }, { material: 'Elastane', percentage: 2 }], care: 'Wash warm', eol: 'Recycle textiles', cert: { scheme: 'GOTS', id: 'GOTS-2002', validUntil: '2030-12-31' } },
	{ title: 'Polo Shirt', brand: 'Smart', sku: 'POL-030', gtin: '00012345600018', comp: [{ material: 'Cotton', percentage: 100 }], care: 'Wash cold', eol: 'Donate', cert: { scheme: 'OEKO-TEX', id: 'OTX-1003', validUntil: '2030-12-31' } },
	{ title: 'Beanie', brand: 'WarmWear', sku: 'BEA-040', gtin: '00012345600019', comp: [{ material: 'Recycled Wool', percentage: 100, recycled: true, recycledContentPct: 100 }], care: 'Hand wash', eol: 'Recycle', cert: { scheme: 'RWS', id: 'RWS-3002', validUntil: '2030-12-31' } }
];

function visibility() {
	return { publicFields: ['title', 'brand', 'composition', 'circularity', 'compliance', 'identifier'], restrictedFields: ['production', 'operators', 'facilities', 'events'] };
}

async function main() {
	for (const it of items) {
		const payload: any = {
			title: it.title,
			brand: it.brand,
			unit: 'variant',
			identifier: {
				gtin: it.gtin,
				sku: it.sku,
				digitalLinkUri: `${process.env.ID_RESOLVER_BASE_URL || 'http://localhost:8082'}/.well-known/digital-link/01/${it.gtin}`
			},
			composition: it.comp,
			circularity: { careInstructions: it.care, endOfLife: it.eol },
			compliance: { certifications: [it.cert] },
			visibility: visibility()
		};
		const created = await prisma.dppItem.create({ data: { title: payload.title, brand: payload.brand, unit: payload.unit, identifierGtin: payload.identifier.gtin!, identifierSku: payload.identifier.sku!, digitalLinkUri: payload.identifier.digitalLinkUri, data: payload, visibility: payload.visibility } });
		await prisma.version.create({ data: { number: 1, diff: payload, createdBy: 'seed', dppItemId: created.id } });
	}
	console.log('Seeded DPP items:', items.length);
}

main().finally(async () => prisma.$disconnect());