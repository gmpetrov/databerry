export const AcceptedImageMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/avif',
  'image/apng',
  'image/svg+xml',
  'image/webp',
] as const;

export const AcceptedVideoMimeTypes = [
  'video/mp4',
  'video/mpeg',
  'video/webm',
  'video/x-msvideo',
  'video/ogg',
] as const;
export const AcceptedAudioMimeTypes = [
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/aac',
] as const;

export const AcceptedDocumentMimeTypes = [
  'text/css',
  'text/csv',
  'text/javascript',
  'text/plain',
  'text/calendar',
  'application/x-abiword',
  'application/x-freearc',
  'application/vnd.amazon.ebook',
  'application/x-bzip2',
  'application/x-cdf',
  'application/x-csh',

  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-fontobject',
  'application/epub+zip',
  'application/epub+zip',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.text',
  'application/ogg',
  'application/pdf',
  'application/vnd.ms-powerpoint',

  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.rar',
  'application/rtf',
  'application/xhtml+xml',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/gzip',
  'application/zip',
] as const;

export const AcceptedMimeTypes = [
  ...AcceptedImageMimeTypes,
  ...AcceptedVideoMimeTypes,
  ...AcceptedAudioMimeTypes,
  ...AcceptedDocumentMimeTypes,
];

export const AcceptedDatasourceFileMimeTypes = [
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/json',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const AcceptedAIDisabledMimeType = [
  ...AcceptedImageMimeTypes,
  ...AcceptedVideoMimeTypes,
  ...AcceptedAudioMimeTypes,
  ...AcceptedDocumentMimeTypes,
];

export const AcceptedAIEnabledMimeTypes = [
  ...AcceptedDatasourceFileMimeTypes,
  // Claude 3 + GPT-4-turbo vision commpatible with png, jpeg, gif, webp
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];
