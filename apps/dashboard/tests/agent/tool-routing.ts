import axios from 'axios';

(async () => {
  /*
    Agent config: 
    - datastore tool
    - lead capture tool (email, required to continue conversation)
    - http tool (cat)
    - mark as resolved tool
    - request human tool
  */

  const queries = [
    'Hi',
    `What's Chaindesk?`,
    `georges@chaindesk.ai +33661838314`,
    `Yes that's correct`,
    `What's Chaindesk?`,
    `Perfect that's all I need`,
  ];
  const url =
    'http://localhost:3000/api/agents/clrz0tn6h000108kxfyomdzxg/query';

  let conversationId = '';

  for (const q of queries) {
    const r = await axios.post(url, {
      query: q,
      conversationId,
    });
    conversationId = r.data.conversationId;

    console.log(`Q: ${q}\nA: ${r.data.answer}`);
  }
})();
