import {
  mediaHandlerConfig,
  createMediaHandler,
} from "next-tinacms-cloudinary/dist/handlers.js";

import pkg from "@tinacms/auth";
const { isAuthorized } = pkg;

export const config = mediaHandlerConfig;

// Log configuration status at startup (without exposing secrets)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('[Cloudinary Media Handler] Configuration check:', {
  hasCloudName: !!cloudName,
  hasApiKey: !!apiKey,
  hasApiSecret: !!apiSecret,
  cloudName: cloudName || 'NOT SET',
  nodeEnv: process.env.NODE_ENV,
});

if (!cloudName || !apiKey || !apiSecret) {
  console.error('[Cloudinary Media Handler] MISSING ENVIRONMENT VARIABLES!');
  console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

export default createMediaHandler({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  authorized: async (req, _res) => {
    try {
      console.log('[Cloudinary Auth] Checking authorization...');
      console.log('[Cloudinary Auth] NODE_ENV:', process.env.NODE_ENV);

      if (process.env.NODE_ENV === "development") {
        console.log('[Cloudinary Auth] Development mode - allowing access');
        return true;
      }

      const user = await isAuthorized(req);
      const isVerified = user?.verified || false;

      console.log('[Cloudinary Auth] User verified:', isVerified);
      return isVerified;
    } catch (e) {
      console.error('[Cloudinary Auth] Authorization error:', e.message || e);
      return false;
    }
  },
});
