import mime from 'mime-types';

const getFileExtFromMimeType = (mimeType: string) => {
  return mime.extension(mimeType);
};

export default getFileExtFromMimeType;
