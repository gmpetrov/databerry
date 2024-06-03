'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

import { TextGenerateEffect } from './ui/TextGenerateEffect';

import FeatureChat from '@/public/images/chat.png';
import FeatureImage01 from '@/public/images/feature-post-01.png';
import FeatureImage02 from '@/public/images/feature-post-02.png';
import FeatureImage03 from '@/public/images/feature-post-03.png';
import FeatureImage05 from '@/public/images/feature-post-05.png';
import FeatureImage04 from '@/public/images/monitor.png';
import {
  defaultChildVariants,
  defaultContainerVariants,
  makeVariants,
} from '@/utils/motion';

export default function Features02() {
  const childTextVariants = makeVariants({
    ...defaultChildVariants,
    hidden: {
      opacity: 0,
      y: 0,
    },
  });

  return (
    <section>
      <motion.div
        className="py-12 md:py-20"
        variants={defaultContainerVariants}
        initial="hidden"
        whileInView={'visible'}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-6xl px-4 mx-auto sm:px-6">
          <div className="relative max-w-3xl pb-12 mx-auto text-center md:pb-20">
            <motion.h2
              className="mb-4 text-3xl font-bold font-bricolage-grotesque md:text-4xl text-zinc-900"
              variants={childTextVariants}
            >
              <TextGenerateEffect
                text="Instantly Resolve 80% of Your Support Queries"
                duration={0.5}
              ></TextGenerateEffect>
            </motion.h2>
            <motion.p
              className="text-lg text-zinc-500"
              variants={childTextVariants}
            >
              <TextGenerateEffect
                duration={0.5}
                text={`Chaindesk leverages Generative AI models like GPT-4 to provide secure, precise responses, resolving customer inquiries and instantly reducing your team’s ticket volume.`}
              />
            </motion.p>
          </div>
          <motion.div
            className="grid max-w-xs gap-8 mx-auto sm:max-w-none sm:grid-cols-2 md:grid-cols-3 sm:gap-4 lg:gap-8"
            variants={makeVariants({
              ...defaultContainerVariants,
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            })}
          >
            <motion.article
              className="sm:col-span-2 flex flex-col border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg"
              variants={defaultChildVariants}
            >
              <div className="flex flex-col p-5 pt-6 grow">
                <div className="flex items-center mb-1 space-x-3">
                  <svg
                    className="inline-flex fill-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="M17 9c.6 0 1 .4 1 1v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h6c.6 0 1 .4 1 1s-.4 1-1 1H4v12h12v-6c0-.6.4-1 1-1Zm-.7-6.7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-8 8c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l8-8Z" />
                  </svg>
                  <h3 className="font-semibold font-bricolage-grotesque text-zinc-900">
                    Instant Answers from Diverse Sources. 24/7.
                    {/* Experience uninterrupted conversations, anytime, anywhere. */}
                  </h3>
                </div>
                <p className="max-w-md text-sm grow text-zinc-500">
                  Chaindesk ingests content seamlessly from various sources
                  including Files, Notion, Google Drive, Zendesk Help Center,
                  and any public URL for comprehensive responses.
                </p>
              </div>
              <figure className="overflow-hidden">
                <div className="relative px-4 pt-6 pb-12 mx-4 -mb-12 overflow-hidden border bg-gradient-to-t from-purple-100 rounded-2xl border-zinc-200">
                  <Image
                    className="object-cover object-left mx-auto sm:object-contain sm:h-auto w-[500px]"
                    src={FeatureChat}
                    width={721}
                    height={280}
                    alt="Feature Post 01"
                  />
                </div>
              </figure>
            </motion.article>
            <motion.article
              className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg"
              variants={defaultChildVariants}
            >
              <div className="flex flex-col p-5 pt-6 grow">
                <div className="flex items-center mb-1 space-x-3">
                  <svg
                    className="inline-flex fill-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="m6.035 17.335-4-14c-.2-.8.5-1.5 1.3-1.3l14 4c.9.3 1 1.5.1 1.9l-6.6 2.9-2.8 6.6c-.5.9-1.7.8-2-.1Zm-1.5-12.8 2.7 9.5 1.9-4.4c.1-.2.3-.4.5-.5l4.4-1.9-9.5-2.7Z" />
                  </svg>
                  <h3 className="font-semibold font-bricolage-grotesque text-zinc-900">
                    Trustworthy AI
                  </h3>
                </div>
                <p className="max-w-md text-sm grow text-zinc-500">
                  With built-in safeguards, Chaindesk Agents provides precise
                  responses that stick to your knowledge base, eliminating
                  off-topic conversations and misleading responses.
                </p>
              </div>
              <figure>
                <Image
                  className="h-[280px] object-cover object-left mx-auto sm:object-contain sm:h-auto"
                  src={FeatureImage02}
                  width={342}
                  height={280}
                  alt="Feature Post 02"
                />
              </figure>
            </motion.article>
            <motion.article
              className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg"
              variants={defaultChildVariants}
            >
              <div className="flex flex-col p-5 pt-6 grow">
                <div className="flex items-center mb-1 space-x-3">
                  <svg
                    className="inline-flex fill-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="M9.3 11.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0ZM9.3 17.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0ZM2.3 12.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0Z" />
                  </svg>
                  <h3 className="font-semibold font-bricolage-grotesque text-zinc-900">
                    Omnichannel Conversations
                  </h3>
                </div>
                <p className="max-w-md text-sm grow text-zinc-500">
                  Chaindesk ensures uninterrupted conversations across platforms
                  including Embeddable Widgets, WhatsApp, Slack, Telegram, and
                  more.
                </p>
              </div>
              <figure>
                <Image
                  className="h-[280px] object-cover object-left mx-auto sm:object-contain sm:h-auto -mt-16"
                  src={FeatureImage04}
                  width={342}
                  height={280}
                  alt="Feature Post 04"
                />
              </figure>
            </motion.article>
            <motion.article
              className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg"
              variants={defaultChildVariants}
            >
              <div className="flex flex-col p-5 pt-6 grow">
                <div className="flex items-center mb-1 space-x-3">
                  <svg
                    className="inline-flex fill-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="M16 2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h8.667l3.733 2.8A1 1 0 0 0 18 17V4a2 2 0 0 0-2-2Zm0 13-2.4-1.8a1 1 0 0 0-.6-.2H4V4h12v11Z" />
                  </svg>
                  <h3 className="font-semibold font-bricolage-grotesque text-zinc-900">
                    Human Handoff
                  </h3>
                </div>
                <p className="max-w-md text-sm grow text-zinc-500">
                  Take over your AI chatbot when needed. Focus on important
                  conversations.
                </p>
              </div>
              <figure>
                <Image
                  className="h-[280px] object-cover object-left mx-auto sm:object-contain sm:h-auto"
                  src={FeatureImage05}
                  width={342}
                  height={280}
                  alt="Feature Post 05"
                />
              </figure>
            </motion.article>

            <motion.article
              className="flex flex-col border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg"
              variants={defaultChildVariants}
            >
              <div className="flex flex-col p-5 pt-6 grow">
                <div className="flex items-center mb-1 space-x-3">
                  <svg
                    className="inline-flex fill-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="M8.974 16c-.3 0-.7-.2-.9-.5l-2.2-3.7-2.1 2.8c-.3.4-1 .5-1.4.2-.4-.3-.5-1-.2-1.4l3-4c.2-.3.5-.4.9-.4.3 0 .6.2.8.5l2 3.3 3.3-8.1c0-.4.4-.7.8-.7s.8.2.9.6l4 8c.2.5 0 1.1-.4 1.3-.5.2-1.1 0-1.3-.4l-3-6-3.2 7.9c-.2.4-.6.6-1 .6Z" />
                  </svg>
                  <h3 className="font-semibold font-bricolage-grotesque text-zinc-900">
                    Embed easily on your site
                  </h3>
                </div>
                <p className="max-w-md text-sm grow text-zinc-500">
                  Choose a widget and add your AI chatbot to your website in
                  minutes.
                </p>
              </div>
              <figure>
                <Image
                  className="h-[280px] object-cover object-left mx-auto sm:object-contain sm:h-auto"
                  src={FeatureImage03}
                  width={342}
                  height={280}
                  alt="Feature Post 03"
                />
              </figure>
            </motion.article>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
