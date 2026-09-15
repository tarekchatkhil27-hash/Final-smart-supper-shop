import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Using base64 encoding to upload to Cloudinary
    const base64Data = buffer.toString('base64');
    const fileUri = 'data:' + file.type + ';base64,' + base64Data;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
        return NextResponse.json({ error: 'Missing Cloudinary credentials' }, { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = crypto.createHash('sha1').update('timestamp=' + timestamp + apiSecret).digest('hex');

    const uploadFormData = new FormData();
    uploadFormData.append('file', fileUri);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadFormData,
    });
    
    const result = await response.json();
    
    if (result.secure_url) {
      return NextResponse.json({ url: result.secure_url });
    } else {
      return NextResponse.json({ error: result.error?.message || 'Upload failed' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
