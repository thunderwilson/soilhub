import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      console.error('No image data provided');
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    console.log('Received image data, length:', image.length);

    // Convert base64 to buffer
    const buffer = Buffer.from(image.split(',')[1], 'base64');

    console.log('Uploading to Vercel Blob...');
    const blob = await put('excalidraw-image.png', buffer, {
      access: 'public',
    });

    console.log('Upload successful, URL:', blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ error: 'Error uploading image' }, { status: 500 });
  }
}