// SELECT user_name, created_at, feature, usecase, datastore_name, datasource_name, comment, prompt_type, prompt, result,
//        CASE
//     WHEN feature = 'qa' THEN score_1
//     ELSE NULL
//   END AS "style redactionnelle adapté à la recherche",
//   CASE
//     WHEN feature = 'qa' THEN score_2
//     ELSE NULL
//   END AS "respect du prompt",
//   CASE
//     WHEN feature = 'qa' THEN score_3
//     ELSE NULL
//   END AS "exhaustivité de la reponse",
//   CASE
//     WHEN feature = 'writing' THEN score_1
//     ELSE NULL
//   END AS "qualité redactionnelle - forme",
//   CASE
//     WHEN feature = 'writing' THEN score_2
//     ELSE NULL
//   END AS "respect du prompt",
//   CASE
//     WHEN feature = 'writing' THEN score_3
//     ELSE NULL
//   END AS "qualité des infos  exposées",
//   CASE
//     WHEN feature = 'summary' THEN score_1
//     ELSE NULL
//   END AS "qualité redactionnelle - forme",
//   CASE
//     WHEN feature = 'summary' THEN score_2
//     ELSE NULL
//   END AS "completude par rapport au prompt",
//   CASE
//     WHEN feature = 'summary' THEN score_3
//     ELSE NULL
//   END AS "pertinence de la réponse - fond"
// FROM xp_bnp_evals

import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const evalBNP = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const data = req.body as {
    result: string;
    name: string;
    useCase: string;
    feature: string;
    prompt: string;
    promptType: string;
    score_1: string;
    score_2: string;
    score_3: string;
    comment: string;
    datastoreName?: string;
    datasourceName?: string;
  };

  const newEval = await prisma.xPBNPEval.create({
    data: {
      comment: data.comment,
      prompt: data.prompt,
      promptType: data.promptType,
      feature: data.feature,
      score1: Number(data.score_1),
      score2: Number(data.score_2),
      score3: Number(data.score_3),
      usecase: data.useCase,
      userName: data.name,
      result: data.result,
      datasourceName: data.datasourceName,
      datastoreName: data.datastoreName,
    },
  });

  return newEval;
};

handler.post(respond(evalBNP));

export default handler;
