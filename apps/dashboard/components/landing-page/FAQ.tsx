const faqs = [
  {
    id: 1,
    question: 'What should my data look like?',
    answer:
      'You can upload one or multiple files in 1 datastore (PDF, CSV, JSON, Text, PowerPoint, Word, Excel), or add a link to your website to be scraped. 1 chatbot is associated with 1 datastore.',
  },
  {
    id: 2,
    question: 'Does it use ChatGPT ?',
    answer:
      'Yes, your chatbot uses ChatGPT (gpt-4). We are planning to support other models in the future.',
  },
  {
    id: 3,
    question: 'Where is my data stored ?',
    answer:
      'The content of the document is hosted on secure AWS servers in Europe.',
  },
  {
    id: 4,
    question: 'Does it support other languages?',
    answer:
      'Yes, Chaindesk supports about +100 languages. You can have your sources in any language and ask it questions in any language.',
  },
  {
    id: 5,
    question: 'How can I add my chatbot to my website?',
    answer:
      'You can embed an iframe or add a chat bubble to the bottom right/left of your website.',
  },
  {
    id: 6,
    question: 'Can I give my chatbots instructions?',
    answer:
      'Yes, you can edit the base prompt and give your chatbot a name, personality traits and instructions on how to answer questions ex. (only answer in French).',
  },

  // More questions...
];

export default function FAQ() {
  return (
    <div className="bg-black">
      <div className="px-6 py-16 mx-auto max-w-7xl sm:py-24 lg:px-8">
        <h2 className="text-2xl font-bold leading-10 tracking-tight text-white">
          Frequently asked questions
        </h2>
        <p className="max-w-2xl mt-6 text-base leading-7 text-gray-300">
          Have a different question and can’t find the answer you’re looking
          for? Reach out to our support team by{' '}
          <a
            href="mailto:support@chaindesk.ai"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            sending us an email
          </a>{' '}
          and we’ll get back to you as soon as we can.
        </p>
        <div className="mt-20">
          <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:grid-cols-3 lg:gap-x-10">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="text-base font-semibold leading-7 text-white">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-300">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
