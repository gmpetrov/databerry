'use client';

import { Transition } from '@headlessui/react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { TextGenerateEffect } from './ui/TextGenerateEffect';

import FeatureImage01 from '@/public/images/feature-01.png';
import FeatureIllustration from '@/public/images/feature-illustration.png';
import {
  defaultChildVariants,
  defaultContainerVariants,
  makeVariants,
} from '@/utils/motion';

export default function Features01() {
  const [tab, setTab] = useState<number>(1);

  const tabs = useRef<HTMLDivElement>(null);

  const heightFix = () => {
    if (tabs.current && tabs.current.parentElement)
      tabs.current.parentElement.style.height = `${tabs.current.clientHeight}px`;
  };

  useEffect(() => {
    heightFix();
  }, []);

  const childTextVariants = makeVariants({
    ...defaultChildVariants,
    hidden: {
      opacity: 0,
      y: 0,
    },
  });

  return (
    <section className="relative bg-zinc-50">
      <motion.div
        className="py-12 md:py-20"
        variants={defaultContainerVariants}
        initial="hidden"
        whileInView={'visible'}
        viewport={{ once: true, margin: '-300px' }}
      >
        <div className="px-4 mx-auto max-w-6xl sm:px-6">
          <div className="pb-12 mx-auto max-w-3xl text-center">
            <motion.div
              key={0}
              className="mb-4 text-3xl font-bold font-bricolage-grotesque md:text-4xl text-zinc-900"
              variants={childTextVariants}
            >
              <TextGenerateEffect
                duration={0.5}
                text={`An AI-powered support ecosystem`}
              ></TextGenerateEffect>
            </motion.div>
            <motion.p
              key={1}
              className="text-lg text-zinc-500"
              variants={childTextVariants}
            >
              <TextGenerateEffect
                duration={0.5}
                text={`AI reads and understands your designs, and with nothing more than a single line of feedback, perform complex actions autonomously.`}
              ></TextGenerateEffect>
            </motion.p>
          </div>
          <motion.div
            variants={makeVariants({
              ...defaultChildVariants,
              visible: {
                ...defaultChildVariants.visible,
                transition: {
                  duration: 1,
                },
              },
            })}
          >
            {/* Tabs buttons */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              <motion.div>
                <button
                  className={`text-left px-4 py-5 border border-transparent rounded ${
                    tab !== 1
                      ? 'bg-zinc-100 opacity-60 hover:opacity-100 transition'
                      : '[background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] shadow-sm rotate-1'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(1);
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold font-bricolage-grotesque text-zinc-900">
                      Shared Inbox
                    </div>
                    <svg
                      className={`fill-zinc-400 shrink-0 ml-2 ${
                        tab !== 1 ? 'hidden' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                    >
                      <path d="M8.667.186H2.675a.999.999 0 0 0 0 1.998h3.581L.971 7.469a.999.999 0 1 0 1.412 1.412l5.285-5.285v3.58a.999.999 0 1 0 1.998 0V1.186a.999.999 0 0 0-.999-.999Z" />
                    </svg>
                  </div>
                  <div className="text-sm text-zinc-500">
                    Visually structure your designs and structure them easily.
                  </div>
                </button>
              </motion.div>

              <motion.div>
                <button
                  className={`text-left px-4 py-5 border border-transparent rounded ${
                    tab !== 2
                      ? 'bg-zinc-100 opacity-60 hover:opacity-100 transition'
                      : '[background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] shadow-sm rotate-1'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(2);
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold font-bricolage-grotesque text-zinc-900">
                      Creative Mode
                    </div>
                    <svg
                      className={`fill-zinc-400 shrink-0 ml-2 ${
                        tab !== 2 ? 'hidden' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                    >
                      <path d="M8.667.186H2.675a.999.999 0 0 0 0 1.998h3.581L.971 7.469a.999.999 0 1 0 1.412 1.412l5.285-5.285v3.58a.999.999 0 1 0 1.998 0V1.186a.999.999 0 0 0-.999-.999Z" />
                    </svg>
                  </div>
                  <div className="text-sm text-zinc-500">
                    Visually structure your designs and structure them easily.
                  </div>
                </button>
              </motion.div>
              <motion.div>
                <button
                  className={`text-left px-4 py-5 border border-transparent rounded ${
                    tab !== 3
                      ? 'bg-zinc-100 opacity-60 hover:opacity-100 transition'
                      : '[background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] shadow-sm rotate-1'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(3);
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold font-bricolage-grotesque text-zinc-900">
                      Realistic Images
                    </div>
                    <svg
                      className={`fill-zinc-400 shrink-0 ml-2 ${
                        tab !== 3 ? 'hidden' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                    >
                      <path d="M8.667.186H2.675a.999.999 0 0 0 0 1.998h3.581L.971 7.469a.999.999 0 1 0 1.412 1.412l5.285-5.285v3.58a.999.999 0 1 0 1.998 0V1.186a.999.999 0 0 0-.999-.999Z" />
                    </svg>
                  </div>
                  <div className="text-sm text-zinc-500">
                    Visually structure your designs and structure them easily.
                  </div>
                </button>
              </motion.div>
              <motion.div>
                <button
                  className={`text-left px-4 py-5 border border-transparent rounded ${
                    tab !== 4
                      ? 'bg-zinc-100 opacity-60 hover:opacity-100 transition'
                      : '[background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] shadow-sm rotate-1'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(4);
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold font-bricolage-grotesque text-zinc-900">
                      Powerful Plugins
                    </div>
                    <svg
                      className={`fill-zinc-400 shrink-0 ml-2 ${
                        tab !== 4 ? 'hidden' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                    >
                      <path d="M8.667.186H2.675a.999.999 0 0 0 0 1.998h3.581L.971 7.469a.999.999 0 1 0 1.412 1.412l5.285-5.285v3.58a.999.999 0 1 0 1.998 0V1.186a.999.999 0 0 0-.999-.999Z" />
                    </svg>
                  </div>
                  <div className="text-sm text-zinc-500">
                    Visually structure your designs and structure them easily.
                  </div>
                </button>
              </motion.div>
            </div>
            {/* Tabs items */}
            <div className="relative lg:max-w-none [mask-image:linear-gradient(white_0%,white_calc(100%-40px),_transparent_calc(100%-1px))] -mx-6">
              <div
                className="flex relative flex-col pt-12 mx-6 md:pt-20"
                ref={tabs}
              >
                {/* Item 1 */}
                <Transition
                  show={tab === 1}
                  className="w-full text-center"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="inline-flex relative align-top">
                    <Image
                      className="rounded-t-lg border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] box-content shadow-2xl"
                      src={FeatureImage01}
                      width={600}
                      height={360}
                      alt="Feature 01"
                    />
                    <Image
                      className="absolute top-0 left-full -translate-x-[70%] -mr-20 max-md:w-[45%]"
                      src={FeatureIllustration}
                      width={273}
                      height={288}
                      alt="Illustration"
                      aria-hidden="true"
                    />
                  </div>
                </Transition>
                {/* Item 2 */}
                <Transition
                  show={tab === 2}
                  className="w-full text-center"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="inline-flex relative align-top">
                    <Image
                      className="rounded-t-lg border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] box-content shadow-2xl"
                      src={FeatureImage01}
                      width={600}
                      height={360}
                      alt="Feature 02"
                    />
                    <Image
                      className="absolute top-0 left-full -translate-x-[70%] -mr-20 max-md:w-[45%]"
                      src={FeatureIllustration}
                      width={273}
                      height={288}
                      alt="Illustration"
                      aria-hidden="true"
                    />
                  </div>
                </Transition>
                {/* Item 3 */}
                <Transition
                  show={tab === 3}
                  className="w-full text-center"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="inline-flex relative align-top">
                    <Image
                      className="rounded-t-lg border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] box-content shadow-2xl"
                      src={FeatureImage01}
                      width={600}
                      height={360}
                      alt="Feature 03"
                    />
                    <Image
                      className="absolute top-0 left-full -translate-x-[70%] -mr-20 max-md:w-[45%]"
                      src={FeatureIllustration}
                      width={273}
                      height={288}
                      alt="Illustration"
                      aria-hidden="true"
                    />
                  </div>
                </Transition>
                {/* Item 4 */}
                <Transition
                  show={tab === 4}
                  className="w-full text-center"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="inline-flex relative align-top">
                    <Image
                      className="rounded-t-lg border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] box-content shadow-2xl"
                      src={FeatureImage01}
                      width={600}
                      height={360}
                      alt="Feature 04"
                    />
                    <Image
                      className="absolute top-0 left-full -translate-x-[70%] -mr-20 max-md:w-[45%]"
                      src={FeatureIllustration}
                      width={273}
                      height={288}
                      alt="Illustration"
                      aria-hidden="true"
                    />
                  </div>
                </Transition>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
