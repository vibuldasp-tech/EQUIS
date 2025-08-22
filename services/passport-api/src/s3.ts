import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
	region: process.env.S3_REGION || 'eu-central-1',
	endpoint: process.env.S3_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
	}
});

export async function getEvidenceSignedUrl(filename: string, contentType: string) {
	const bucket = process.env.S3_BUCKET_EVIDENCE || 'dpp-evidence';
	const key = `${Date.now()}-${filename}`;
	const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
	const url = await getSignedUrl(client, command, { expiresIn: 900 });
	return { url, key };
}