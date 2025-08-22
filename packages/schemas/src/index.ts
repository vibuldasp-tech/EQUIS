import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import dppProfile from './profiles/textiles-minimal-2027.json' assert { type: 'json' };
import passportApiOpenApi from '../openapi/passport-api.json' assert { type: 'json' };
import idResolverOpenApi from '../openapi/id-resolver.json' assert { type: 'json' };
import epcisOpenApi from '../openapi/epcis-api.json' assert { type: 'json' };

export const profiles = {
	'default': dppProfile,
	'textiles-minimal-2027': dppProfile
};

export const openapi = {
	passportApi: passportApiOpenApi,
	idResolver: idResolverOpenApi,
	epcisApi: epcisOpenApi
};

export type ValidationResult = {
	valid: boolean;
	errors?: ErrorObject[];
};

export function createValidator() {
	const ajv = new Ajv({ allErrors: true, strict: false });
	addFormats(ajv);
	return ajv;
}

export function validateDpp(payload: any): ValidationResult {
	const ajv = createValidator();
	const validate = ajv.compile(profiles['textiles-minimal-2027']);
	const valid = validate(payload);
	const errors: ErrorObject[] = [];
	if (!valid && validate.errors) errors.push(...validate.errors);
	if (payload && Array.isArray((payload as any).composition)) {
		const sum = (payload as any).composition.reduce((acc: number, c: any) => acc + (Number(c.percentage) || 0), 0);
		if (Math.abs(sum - 100) > 0.5) {
			errors.push({ keyword: 'compositionTotal', instancePath: '/composition', schemaPath: '#/properties/composition', params: { sum }, message: 'sum(percentage) must equal 100 ± 0.5' } as any);
		}
	}
	return { valid: errors.length === 0, errors: errors.length ? errors : undefined };
}