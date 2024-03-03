import React from 'react';

type Props = {};

function PromoAlert({}: Props) {
  return (
    <div className="hidden sm:mb-8 sm:flex sm:justify-center">
      <div className="inline-flex relative px-3 py-1 space-x-2 text-sm leading-6 text-gray-600 rounded-full ring-1 ring-gray-900/10 hover:ring-gray-900/20">
        <span className="font-extrabold text-pink-400 font-caveat">NEW</span>
        <span>Train a custom GPT Chatbot on YouTube videos</span>
        <a
          href={`https://app.chaindesk.ai/agents?utm_source=landing_page&utm_medium=tool&utm_campaign=youtube_summarizer`}
          className="font-semibold text-pink-400"
          target="_blank"
        >
          <span className="absolute inset-0" aria-hidden="true" />
          Try Now <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  );
}

export default PromoAlert;
