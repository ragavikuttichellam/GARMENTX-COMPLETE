const dotenv = require('dotenv');
dotenv.config();

let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET,
    secure: true
  });
} catch (err) {
  // graceful fallback when cloudinary package isn't installed or fails to load
  console.warn('⚠️ Cloudinary module not available — uploads disabled. Install `cloudinary` to enable image uploads.');
  const { PassThrough } = require('stream');
  cloudinary = {
    uploader: {
      upload_stream: (opts, cb) => {
        const stream = new PassThrough();
        process.nextTick(() => cb(new Error('Cloudinary not available')));
        return stream;
      },
      destroy: async (public_id) => ({ result: 'not_available' })
    }
  };
}

module.exports = cloudinary;
