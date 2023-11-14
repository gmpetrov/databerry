import { PassThrough, Readable } from 'stream';

import ffmpeg from '../fluent-ffmpeg';

interface Args {
  res: Readable;
  startTime: number;
  duration: number;
}

async function sliceAudioStream({ res, startTime, duration }: Args) {
  return new Promise((resolve, reject) => {
    const bufferStream = new PassThrough();
    const buffers: Buffer[] = [];
    ffmpeg(res)
      .audioCodec('libmp3lame')
      .format('mp3')
      .setStartTime(startTime)
      .setDuration(duration)
      .on('end', () => {
        const outputBuffer = Buffer.concat(buffers);
        // bind the event to a promise
        resolve(outputBuffer);
      })
      .on('error', (err) => {
        console.error('Error:', err);
        reject(err);
      })
      .pipe(bufferStream);
    bufferStream.on('data', function (buf) {
      buffers.push(buf);
    });
  });
}

export default sliceAudioStream;
