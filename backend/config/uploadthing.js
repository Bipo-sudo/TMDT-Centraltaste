require('dotenv').config();

const { createUploadthing, createRouteHandler } = require('uploadthing/express');

const f = createUploadthing();

const uploadRouter = {
  mediaUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 10 },
    video: { maxFileSize: '64MB', maxFileCount: 2 },
  })
    .middleware(async () => {
      return {
        source: 'admin-media',
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('UploadThing file uploaded:', {
        key: file.key,
        url: file.url,
        metadata,
      });

      return {
        uploadedBy: metadata?.source || 'admin-media',
        fileKey: file.key,
      };
    }),
};

const uploadThingRouteHandler = createRouteHandler({
  router: uploadRouter,
});

module.exports = {
  uploadRouter,
  uploadThingRouteHandler,
};