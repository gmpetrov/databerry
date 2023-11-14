import { AppDocument } from './types/document';
import cleanTextForEmbeddings from './clean-text-for-embeddings';

function transcriptToDocs(transcript: string): AppDocument<any>[] {
  const lines = transcript.split('\n');
  const docs: AppDocument<any>[] = [];

  for (let i = 0; i < lines.length; i++) {
    // Match lines with time codes
    const timeCodeMatch = lines[i].match(
      /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/
    );
    if (timeCodeMatch && lines[i + 1]) {
      docs.push(
        new AppDocument<any>({
          metadata: {
            start_time_code: timeCodeMatch[1],
            end_time_code: timeCodeMatch[2],
          },
          pageContent: cleanTextForEmbeddings(lines[i + 1].trim()),
        })
      );
      i++; // Skip the next line as it's already processed
    }
  }

  return docs;
}

export default transcriptToDocs;
