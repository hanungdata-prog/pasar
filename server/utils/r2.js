import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

export const uploadBase64Image = async (base64Str) => {
    try {
        // If it's not a base64 string, just return it (might already be a URL)
        if (!base64Str.startsWith('data:image/')) {
            return base64Str;
        }

        // Extract the mime type and the actual base64 data
        const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image data');
        }

        const mimeType = `image/${matches[1]}`;
        const base64Data = matches[2];

        // Map mime type to file extension
        let extension = matches[1];
        if (extension === 'jpeg') extension = 'jpg';

        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${Date.now()}-${uuidv4()}.${extension}`;

        const params = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: mimeType,
            ContentDisposition: 'inline',
            // ACL: 'public-read' // optional, depending on R2 bucket settings. Typically we don't need this if bucket has public policy or custom domain
        };

        await r2Client.send(new PutObjectCommand(params));

        // Return the public URL
        const publicUrlPrefix = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
        return `${publicUrlPrefix}/${filename}`;
    } catch (error) {
        console.error('Error uploading image to R2:', error);
        throw new Error(`Cloudflare R2 Upload Error: ${error.message || 'Unknown error'}`);
    }
};
