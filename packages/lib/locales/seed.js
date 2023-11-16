const fs = require('fs');
const OpenAI = require('openai');
const OPENAI_API_KEY = 'XXXXXXX';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const langs = [
  //  ['french', 'fr'],
];

// TODO: use json mode when available.
const callToAi = async (language) => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `your job is to help user translate the values of their json into a target language  `,
      },
      {
        role: 'user',
        content: `translate this given json object : ${JSON.stringify({
          crisp: {
            choices: {
              resolve: 'Mark as resolved',
              request: 'Request a human operator',
              enableAi: 'Re-enable AI',
            },
            instructions: {
              callback: 'An operator will get back to you shortly.',
              unavailable:
                'Unfortunately, no operators are available at the moment.',
            },
          },
          chatbubble: {
            actions: {
              resolve: 'Mark As Resolved',
              request: 'Request  Human',
            },
            lead: {
              instruction: 'Let us know how to contact you',
              email: 'email',
              required: 'Required to request a human operator',
            },
          },
        })} into arabic, only translate the values and keep the keys in ${
          language[0]
        }`,
      },
    ],
    model: 'gpt-3.5-turbo',
  });
  console.log(completion.choices[0].message.content);
  return JSON.parse(completion.choices[0].message.content);
};

const AddTrads = async () => {
  for (const lang of langs) {
    try {
      const translation = await callToAi(lang);
      fs.mkdirSync(lang[1]);

      fs.writeFileSync(
        `./${lang[1]}/translations.json`,
        JSON.stringify(translation),
        'utf8'
      );
    } catch (e) {
      console.log(e);
    }
  }
};
AddTrads();
