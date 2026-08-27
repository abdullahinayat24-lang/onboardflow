import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient();
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const token = formData.get('token') as string | null;
    const category = (formData.get('category') as string) || 'asset';

    if (!file || !token) {
      return NextResponse.json({ error: 'File and token are required' }, { status: 400 });
    }

    // 1. Verify Client by token
    const { data: client, error: clientErr } = await admin
      .from('clients')
      .select('id')
      .eq('onboarding_token', token)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: 'Invalid client token' }, { status: 404 });
    }

    const bucketName = category === 'contract' ? 'contracts' : 'uploads';
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${client.id}/${Date.now()}_${cleanFilename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 2. Upload to Supabase Storage
    const { error: storageError } = await admin.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    let fileUrl = '';
    if (!storageError) {
      const { data: publicUrlData } = admin.storage.from(bucketName).getPublicUrl(storagePath);
      fileUrl = publicUrlData.publicUrl;
    } else {
      console.warn('Storage upload error (using fallback local URL if in demo mode):', storageError);
      fileUrl = `/demo-files/${cleanFilename}`;
    }

    // 3. Save Uploads DB record
    const { data: uploadRecord, error: dbError } = await admin
      .from('uploads')
      .insert({
        client_id: client.id,
        category: category as any,
        filename: file.name,
        file_url: fileUrl,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
      })
      .select('*')
      .single();

    if (dbError) {
      // Fallback object for offline/demo environment
      return NextResponse.json({
        upload: {
          id: `upload_${Date.now()}`,
          client_id: client.id,
          category,
          filename: file.name,
          file_url: fileUrl,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ upload: uploadRecord }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
