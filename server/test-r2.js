import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

async function run() {
    try {
        const buffer = Buffer.from('test', 'utf8');
        const params = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: 'test.txt',
            Body: buffer,
            ContentType: 'text/plain',
        };
        await r2Client.send(new PutObjectCommand(params));
        console.log('Upload success');
    } catch (e) {
        console.error('Upload failed:', e.message);
    }
}
run();
