import { NextApiResponse } from 'next/types';

const streamData = ({
  event,
  data,
  res,
}: {
  event?: string;
  data: string;
  res: NextApiResponse;
}) => {
  const input = data === '[DONE]' ? data : encodeURIComponent(data);
  res.write(`event: ${event || ''}\ndata: ${input}\n\n`);
};

export default streamData;
