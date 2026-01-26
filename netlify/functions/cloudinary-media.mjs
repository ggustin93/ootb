import { v2 as cloudinary } from 'cloudinary';
import { isAuthorized } from '@tinacms/auth';

const VERSION = 'v2-bypass-test';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('[Cloudinary] Config:', {
  hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
});

// Transform Cloudinary response to TinaCMS format
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
async function checkAuth(event) {
  try {
    const context = process.env.CONTEXT || 'unknown';
    const nodeEnv = process.env.NODE_ENV || 'unknown';

    console.log('[Auth] Context:', context, 'NODE_ENV:', nodeEnv);

    // TEMPORARY: Allow all requests for testing
    // TODO: Re-enable proper auth after testing
    console.log('[Auth] TEMPORARY BYPASS - allowing all requests');
    return true;

    // Allow in development or deploy previews
    if (nodeEnv === 'development' || context === 'dev' || context === 'deploy-preview') {
      console.log('[Auth] Dev/Preview mode - allowing');
      return true;
    }

    // In production, check TinaCloud auth
    const req = {
      headers: event.headers,
    };
    const user = await isAuthorized(req);
    console.log('[Auth] User:', user?.verified);
    return user && user.verified;
  } catch (e) {
    console.error('[Auth] Error:', e.message);
    return false;
  }
}

// GET: List media
async function listMedia(params) {
  const directory = params.directory || '';
  const limit = parseInt(params.limit || '500', 10);
  const offset = params.offset || undefined;
  const filesOnly = params.filesOnly === 'true';

  const useRootDirectory = !directory || directory === '/' || directory === '""';
  const query = useRootDirectory ? 'folder=""' : `folder="${directory}"`;

  console.log('[List] Query:', query);

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
        console.error('[Folders] Error:', e.message);
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [...folders, ...files],
      offset: response.next_cursor,
    }),
  };
}

// POST: Upload media (multipart form data)
async function uploadMedia(event) {
  try {
    // Parse multipart form data
    const contentType = event.headers['content-type'] || '';
    let file, directory = '';

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart - extract boundary and parse
      const boundary = contentType.split('boundary=')[1];
      const body = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('binary')
        : event.body;

      // Simple multipart parser
      const parts = body.split(`--${boundary}`);
      for (const part of parts) {
        if (part.includes('name="file"')) {
          const match = part.match(/filename="([^"]+)"/);
          const filename = match ? match[1] : 'upload';
          const dataStart = part.indexOf('\r\n\r\n') + 4;
          const dataEnd = part.lastIndexOf('\r\n');
          const fileData = part.slice(dataStart, dataEnd);
          const base64 = Buffer.from(fileData, 'binary').toString('base64');
          file = `data:application/octet-stream;base64,${base64}`;
        }
        if (part.includes('name="directory"')) {
          const dataStart = part.indexOf('\r\n\r\n') + 4;
          const dataEnd = part.lastIndexOf('\r\n');
          directory = part.slice(dataStart, dataEnd).trim();
        }
      }
    } else {
      // JSON body
      const data = JSON.parse(event.body);
      file = data.file;
      directory = data.directory || '';
    }

    if (!file) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'No file provided' }),
      };
    }

    console.log('[Upload] Directory:', directory);

    const result = await cloudinary.uploader.upload(file, {
      folder: directory.replace(/^\//, ''),
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto',
    });

    console.log('[Upload] Success:', result.public_id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (e) {
    console.error('[Upload] Error:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: e.message }),
    };
  }
}

// DELETE: Delete media
async function deleteMedia(path) {
  const pathParts = path.split('/').filter(Boolean);
  // Remove 'api' and 'cloudinary' from path to get public_id
  const publicId = pathParts.slice(2).join('/');

  if (!publicId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'No public_id provided' }),
    };
  }

  console.log('[Delete] ID:', publicId);
  const result = await cloudinary.uploader.destroy(publicId);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result, public_id: publicId }),
  };
}

// Main handler
export const handler = async (event) => {
  console.log('[Cloudinary]', event.httpMethod, event.path);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }

  // Check auth
  const isAuth = await checkAuth(event);
  if (!isAuth) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Unauthorized', version: VERSION }),
    };
  }

  try {
    let response;
    switch (event.httpMethod) {
      case 'GET':
        response = await listMedia(event.queryStringParameters || {});
        break;
      case 'POST':
        response = await uploadMedia(event);
        break;
      case 'DELETE':
        response = await deleteMedia(event.path);
        break;
      default:
        response = { statusCode: 405, body: 'Method not allowed' };
    }

    // Add CORS headers to response
    response.headers = { ...corsHeaders, ...response.headers };
    return response;
  } catch (e) {
    console.error('[Cloudinary] Error:', e);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: e.message }),
    };
  }
};
