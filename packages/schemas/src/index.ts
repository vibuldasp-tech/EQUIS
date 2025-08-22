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

export function validateDpp(payload: unknown): ValidationResult {
	const ajv = createValidator();
	const validate = ajv.compile(profiles['textiles-minimal-2027']);
	const valid = validate(payload);
	return { valid: Boolean(valid), errors: validate.errors || undefined };
}