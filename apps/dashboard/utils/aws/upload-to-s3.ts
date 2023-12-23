import axios from 'axios';

interface Args {
  generatorUrl: string;
  fileName: string;
  file: File;
}

async function uploadToS3Bucket({ generatorUrl, fileName, file }: Args) {
  // upload text from file to AWS
  const uploadLinkRes = await axios.post(generatorUrl, {
    fileName,
    type: file.type,
  });

  await axios.put(uploadLinkRes.data, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
}

export default uploadToS3Bucket;
