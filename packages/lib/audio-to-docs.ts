import OpenAIApi from 'openai';
import { Readable } from 'stream';

import sliceAudioStream from './audio-helpers/ffmpegSlicer';
import splitIntoTens from './audio-helpers/splitIntoTens';
import transcriptToDocs from './transcript-to-docs';

type Args =
  | { buffer: Buffer; duration?: never; readableStream?: never }
  | { buffer?: never; duration: number; readableStream: Readable };

const audioToDocs = async (args: Args) => {
  const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });
  let transcript = '';

  if (args?.buffer) {
    const file = await OpenAIApi.toFile(args.buffer, 'audio.m4a');
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'vtt',
    });
    transcript += transcription;
  } else {
    const slices = splitIntoTens(args.duration);

    const transcriptionPromises = slices
      .slice(0, -1)
      .map(async (startTime, index) => {
        const chunkBuffer = await sliceAudioStream({
          res: args.readableStream,
          startTime,
          duration: slices[index + 1],
        });

        const file = await OpenAIApi.toFile(chunkBuffer as any, 'audio.m4a');
        const transcript = await openai.audio.transcriptions.create({
          file,
          model: 'whisper-1',
          response_format: 'vtt',
        });
        return { transcript, index };
      });
    const transcripts = (await Promise.all(transcriptionPromises)).sort(
      (a, b) => a.index - b.index
    );

    transcripts.forEach((chunk) => {
      transcript += chunk.transcript;
    });
  }

  return transcriptToDocs(transcript);
};

export default audioToDocs;
