import { Datastore } from '@prisma/client';
import axios from 'axios';
import { NextApiResponse } from 'next';

import {
  AppNextApiRequest,
  ChatRequest,
  ChatResponse,
  SearchResponseSchema,
} from '@app/types';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import getRootDomain from '@app/utils/get-root-domain';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

class DataberryRetriever {
  datastore: Datastore;

  constructor(datastore: Datastore) {
    this.datastore = datastore;
  }

  async getRelevantDocuments(query: string): Promise<any[]> {
    const apiKey = (this.datastore as any).apiKeys?.[0]?.key as string;

    const results = await axios.post(
      `http://${this.datastore.id}.${getRootDomain(
        process.env.NEXT_PUBLIC_DASHBOARD_URL!
      )}/query`,
      {
        queries: [
          {
            query,
            top_k: 3,
          },
        ],
      },
      {
        headers: {
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
      }
    );

    const res = results.data as SearchResponseSchema;

    const docs = res.results?.[0]?.results.map((each) => ({
      metadata: {
        source: (each as any)?.source,
        score: (each as any)?.score,
      } as any,
      pageContent: each?.text,
    }));

    return docs;
  }
}

export const chat = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as ChatRequest;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
    include: {
      apiKeys: true,
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { ConversationalRetrievalQAChain } = await import('langchain/chains');
  const { OpenAI } = await import('langchain/llms');
  const retriever = new DataberryRetriever(datastore);
  const model = new OpenAI({});

  const chain = ConversationalRetrievalQAChain.fromLLM(model as any, retriever);
  const chainResult = await chain.call({
    question: data.query,
    chat_history: [],
  });

  return {
    answer: chainResult.text,
  } as ChatResponse;
};

handler.post(respond(chat));

export default handler;
