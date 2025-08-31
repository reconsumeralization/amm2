import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.BUNNY_STORAGE_ZONE}.storage.bunnycdn.com`,
  credentials: {
    accessKeyId: process.env.BUNNY_API_KEY!,
    secretAccessKey: '',
  },
});

export async function uploadToBunny(buffer: Buffer, fileName: string, tenantId: string): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.BUNNY_STORAGE_ZONE,
      Key: `${tenantId}/${fileName}`,
      Body: buffer,
      ACL: 'public-read',
    });
    await client.send(command);
    return `https://${process.env.BUNNY_STORAGE_ZONE}.b-cdn.net/${tenantId}/${fileName}`;
  } catch (error) {
    console.error('Bunny CDN upload failed:', error);
    throw new Error('Failed to upload to Bunny CDN');
  }
}
