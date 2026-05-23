import { generateReactHelpers, generateUploadButton, generateUploadDropzone } from '@uploadthing/react';

export const { useUploadThing, uploadFiles } = generateReactHelpers({
	url: 'http://localhost:5000/api/uploadthing',
});
export const UploadButton = generateUploadButton({
	url: 'http://localhost:5000/api/uploadthing',
});
export const UploadDropzone = generateUploadDropzone({
	url: 'http://localhost:5000/api/uploadthing',
});
