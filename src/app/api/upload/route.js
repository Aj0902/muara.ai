import { NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'muara_ai';

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file gambar yang diunggah!' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imageUrl = await uploadImageToCloudinary(buffer, folder);

    return NextResponse.json({ url: imageUrl });
  } catch (err) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: 'Gagal mengunggah foto ke Cloudinary: ' + err.message }, { status: 500 });
  }
}
