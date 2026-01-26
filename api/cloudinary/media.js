import { v2 as cloudinary } from 'cloudinary';
import { isAuthorized } from '@tinacms/auth';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

console.log('[Cloudinary Media Handler] Configuration check:', {
  hasCloudName: !!cloudName,
  hasApiKey: !!apiKey,
  hasApiSecret: !!apiSecret,
  cloudName: cloudName || 'NOT SET',
});

// Helper: Transform Cloudinary response to TinaCMS format
function cloudinaryToTina(file) {
  const pathParts = file.public_id.split('/');
  const filename = pathParts.pop();
  const directory = pathParts.join('/');
  const url = file.secure_url || file.url;

  const transform = (url, t) => {
    const parts = url.split('/image/upload/');
    return parts.length === 2 ? `${parts[0]}/image/upload/${t}/${parts[1]}` : url;
  };

  return {
    id: file.public_id,
    filename,
    directory,
    src: url,
    thumbnails: {
      '75x75': transform(url, 'w_75,h_75,c_fit,q_auto'),
      '400x400': transform(url, 'w_400,h_400,c_fit,q_auto'),
      '1000x1000': transform(url, 'w_1000,h_1000,c_fit,q_auto'),
    },
    type: 'file',
  };
}

// Check authorization
async function checkAuth(req) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Cloudinary Auth] Development mode - allowing');
      return true;
    }
    const user = await isAuthorized(req);
    console.log('[Cloudinary Auth] User verified:', user?.verified);
    return user?.verified || false;
  } catch (e) {
    console.error('[Cloudinary Auth] Error:', e.message);
    return false;
  }
}

// GET: List media
async function listMedia(url) {
  const params = url.searchParams;
  const directory = params.get('directory') || '';
  const limit = parseInt(params.get('limit') || '500', 10);
  const offset = params.get('offset') || undefined;
  const filesOnly = params.get('filesOnly') === 'true';

  const useRootDirectory = !directory || directory === '/' || directory === '""';
  const query = useRootDirectory ? 'folder=""' : `folder="${directory}"`;

  console.log('[Cloudinary List] Query:', query, 'Limit:', limit);

  const response = await cloudinary.search
    .expression(query)
    .max_results(limit)
    .next_cursor(offset)
    .execute();

  const files = response.resources.map(cloudinaryToTina);

  let folders = [];
  if (!filesOnly) {
    try {
      const folderRes = useRootDirectory
        ? await cloudinary.api.root_folders()
        : await cloudinary.api.sub_folders(directory);

      if (folderRes?.folders) {
        folders = folderRes.folders.map((folder) => ({
          id: folder.path,
          type: 'dir',
          filename: folder.path.split('/').pop(),
          directory: folder.path.split('/').slice(0, -1).join('/'),
        }));
      }
    } catch (e) {
      if (!e.error?.message?.startsWith("Can't find folder")) {
        console.error('[Cloudinary Folders] Error:', e.message);
      }
    }
  }

  return Response.json({
    items: [...folders, ...files],
    offset: response.next_cursor,
  });
}

// POST: Upload media
async function uploadMedia(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const directory = formData.get('directory') || '';

    if (!file) {
      return Response.json({ message: 'No file provided' }, { status: 400 });
    }

    console.log('[Cloudinary Upload] File:', file.name, 'Dir:', directory);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: directory.replace(/^\//, ''),
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto',
    });

    console.log('[Cloudinary Upload] Success:', result.public_id);
    return Response.json(result);
  } catch (e) {
    console.error('[Cloudinary Upload] Error:', e.message);
    return Response.json({ message: e.message }, { status: e.http_code || 500 });
  }
}

// DELETE: Delete media
async function deleteMedia(url) {
  const pathParts = url.pathname.split('/').filter(Boolean);
  const publicId = pathParts.slice(2).join('/');

  if (!publicId) {
    return Response.json({ message: 'No public_id provided' }, { status: 400 });
  }

  console.log('[Cloudinary Delete] ID:', publicId);
  const result = await cloudinary.uploader.destroy(publicId);
  return Response.json({ result, public_id: publicId });
}

// Main handler - Vercel Serverless Function format
export default async function handler(req) {
  const url = new URL(req.url);
  console.log('[Cloudinary] Request:', req.method, url.pathname);

  // Check auth
  const isAuth = await checkAuth(req);
  if (!isAuth) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await listMedia(url);
      case 'POST':
        return await uploadMedia(req);
      case 'DELETE':
        return await deleteMedia(url);
      default:
        return Response.json({ message: 'Method not allowed' }, { status: 405 });
    }
  } catch (e) {
    console.error('[Cloudinary] Error:', e);
    return Response.json({ message: e.message || 'Server error' }, { status: 500 });
  }
}

// Vercel config
export const config = {
  api: {
    bodyParser: false,
  },
};
