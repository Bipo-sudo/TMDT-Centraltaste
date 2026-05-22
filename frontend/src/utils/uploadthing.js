import { generateReactHelpers, generateUploadButton } from '@uploadthing/react';

export const { useUploadThing, uploadFiles } = generateReactHelpers();
export const UploadButton = generateUploadButton();
