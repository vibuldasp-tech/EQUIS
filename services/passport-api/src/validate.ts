export type ValidationResult = { valid: boolean; errors?: { message: string; path?: string }[] };

export function validateDpp(payload: any): ValidationResult {
	const errors: { message: string; path?: string }[] = [];
	if (!payload || typeof payload !== 'object') return { valid: false, errors: [{ message: 'payload must be object' }] };
	for (const f of ['title', 'brand', 'identifier', 'composition', 'circularity', 'visibility']) {
		if (!(f in payload)) errors.push({ message: `missing required field ${f}`, path: `/${f}` });
	}
	const id = payload.identifier || {};
	if (!(id.gtin || id.sku || id.internalId)) errors.push({ message: 'identifier requires one of gtin|sku|internalId', path: '/identifier' });
	if (!id.digitalLinkUri || !/^https?:\/\//.test(id.digitalLinkUri)) errors.push({ message: 'identifier.digitalLinkUri must be https URL', path: '/identifier/digitalLinkUri' });
	if (!Array.isArray(payload.composition) || payload.composition.length === 0) {
		errors.push({ message: 'composition must be a non-empty array', path: '/composition' });
	} else {
		let sum = 0;
		for (const [i, c] of payload.composition.entries()) {
			if (typeof c.percentage !== 'number') errors.push({ message: 'composition.percentage must be number', path: `/composition/${i}/percentage` });
			else sum += c.percentage;
			if (c.recycledContentPct !== undefined && typeof c.recycledContentPct === 'number' && typeof c.percentage === 'number' && c.recycledContentPct > c.percentage) {
				errors.push({ message: 'recycledContentPct must be <= percentage', path: `/composition/${i}/recycledContentPct` });
			}
		}
		if (Math.abs(sum - 100) > 0.5) errors.push({ message: 'sum(percentage) must equal 100 ± 0.5', path: '/composition' });
	}
	return { valid: errors.length === 0, errors: errors.length ? errors : undefined };
}