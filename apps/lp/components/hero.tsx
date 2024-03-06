'use client';
import { motion, stagger, useAnimate, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import Particles from './ui/particles';
import Clients from './clients';
import TestimonialBadge from './testimonial-badge';

import Stats from '@/components/stats';
import { TextGenerateEffect } from '@/components/ui/TextGenerateEffect';
// import HeroImage from '@/public/images/hero-image.png';
import HeroImage from '@/public/images/dashboard-screenshot.png';
import config from '@/utils/config';
import {
  defaultChildVariants,
  defaultContainerVariants,
  makeVariants,
} from '@/utils/motion';

export default function Hero() {
  // const childVariants = {
  //   hidden: { opacity: 0, y: 20 }, // Start slightly down and faded out
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //   },
  // } as Variants;
  // const childVariants = {
  //   hidden: { opacity: 0, y: 20 }, // Start slightly down and faded out
  //   visible: (custom) => ({
  //     opacity: 1,
  //     y: 0,
  //     transition: { duration: 0.5, delay: custom }, // Control how each App component animates into view
  //   }),
  // } as Variants;

  const childTextVariants = makeVariants({
    ...defaultChildVariants,
    hidden: {
      opacity: 0,
      y: 0,
    },
  });

  return (
    <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
      {/* <Particles className="absolute inset-0 -z-10" /> */}
      <motion.div
        className="pt-32 pb-12 md:pt-40 md:pb-20"
        variants={makeVariants({
          ...defaultContainerVariants,
          visible: {
            transition: {
              staggerChildren: 1,
            },
          },
        })}
        initial="hidden"
        whileInView={'visible'}
        viewport={{ once: true }}
      >
        {/* Section content */}
        <div className="px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="pb-12 text-center md:pb-16">
              <motion.h1
                className="pb-4 mx-auto max-w-2xl text-5xl font-extrabold text-transparent font-bricolage-grotesque md:text-8xl text-zinc-800"
                variants={childTextVariants}
              >
                <TextGenerateEffect
                  duration={0.5}
                  // text="Custom GPT Agent For Your Startup"
                  text={[
                    'Your',
                    'Suport',
                    'On',
                    // <em className="inline-flex relative justify-center items-center italic text-zinc-900">
                    //   {' '}
                    //   GPT Agent
                    //   <motion.svg
                    //     className="absolute fill-pink-300 w-[calc(100%+1rem)] -z-10"
                    //     xmlns="http://www.w3.org/2000/svg"
                    //     width="223"
                    //     height="62"
                    //     viewBox="0 0 223 62"
                    //     // viewBox="0 0 331.25 326.77"
                    //     aria-hidden="true"
                    //     preserveAspectRatio="none"
                    //   >
                    //     <motion.path
                    // variants={{
                    //   hidden: {
                    //     pathLength: 0,
                    //   },
                    //   visible: {
                    //     pathLength: 1,
                    //     transition: {
                    //       delay: 3,
                    //     },
                    //   },
                    // }}
                    // initial="hidden"
                    // animate="visible"
                    // stroke="#f9a8d4"
                    // strokeWidth={5}
                    // strokeDasharray="0 1"
                    // fill="none"
                    //       // d="M415,275Q422,310,417.5,354Q413,398,378,423Q343,448,299,423Q255,398,227.5,389.5Q200,381,151,401.5Q102,422,86,383.5Q70,345,65,309.5Q60,274,78.5,243.5Q97,213,87.5,176.5Q78,140,107.5,122Q137,104,160.5,74Q184,44,222,33Q260,22,293.5,43.5Q327,65,362,81Q397,97,386,142.5Q375,188,391.5,214Q408,240,415,275Z"
                    //       d="M45.654 53.62c17.666 3.154 35.622 4.512 53.558 4.837 17.94.288 35.91-.468 53.702-2.54 8.89-1.062 17.742-2.442 26.455-4.352 8.684-1.945 17.338-4.3 25.303-7.905 3.94-1.81 7.79-3.962 10.634-6.777 1.38-1.41 2.424-2.994 2.758-4.561.358-1.563-.078-3.143-1.046-4.677-.986-1.524-2.43-2.96-4.114-4.175a37.926 37.926 0 0 0-5.422-3.32c-3.84-1.977-7.958-3.563-12.156-4.933-8.42-2.707-17.148-4.653-25.95-6.145-8.802-1.52-17.702-2.56-26.622-3.333-17.852-1.49-35.826-1.776-53.739-.978-8.953.433-17.898 1.125-26.79 2.22-8.887 1.095-17.738 2.541-26.428 4.616-4.342 1.037-8.648 2.226-12.853 3.676-4.197 1.455-8.314 3.16-12.104 5.363-1.862 1.13-3.706 2.333-5.218 3.829-1.52 1.47-2.79 3.193-3.285 5.113-.528 1.912-.127 3.965.951 5.743 1.07 1.785 2.632 3.335 4.348 4.68 2.135 1.652 3.2 2.672 2.986 3.083-.18.362-1.674.114-4.08-1.638-1.863-1.387-3.63-3.014-4.95-5.09C.94 35.316.424 34.148.171 32.89c-.275-1.253-.198-2.579.069-3.822.588-2.515 2.098-4.582 3.76-6.276 1.673-1.724 3.612-3.053 5.57-4.303 3.96-2.426 8.177-4.278 12.457-5.868 4.287-1.584 8.654-2.89 13.054-4.036 8.801-2.292 17.74-3.925 26.716-5.19C70.777 2.131 79.805 1.286 88.846.723c18.087-1.065 36.236-.974 54.325.397 9.041.717 18.07 1.714 27.042 3.225 8.972 1.485 17.895 3.444 26.649 6.253 4.37 1.426 8.697 3.083 12.878 5.243a42.11 42.11 0 0 1 6.094 3.762c1.954 1.44 3.823 3.2 5.283 5.485a12.515 12.515 0 0 1 1.63 3.88c.164.706.184 1.463.253 2.193-.063.73-.094 1.485-.247 2.195-.652 2.886-2.325 5.141-4.09 6.934-3.635 3.533-7.853 5.751-12.083 7.688-8.519 3.778-17.394 6.09-26.296 7.998-8.917 1.86-17.913 3.152-26.928 4.104-18.039 1.851-36.17 2.295-54.239 1.622-18.062-.713-36.112-2.535-53.824-6.23-5.941-1.31-5.217-2.91.361-1.852"
                    //     />
                    //   </motion.svg>
                    // </em>,
                    <em
                      key="gpt-agent"
                      className="inline-flex relative justify-center items-end not-italic"
                    >
                      AutoPilot
                      <motion.svg
                        className="absolute fill-pink-300 w-[calc(100%+1rem)] -z-10"
                        xmlns="http://www.w3.org/2000/svg"
                        width="120"
                        height="10"
                        viewBox="0 0 120 10"
                        aria-hidden="true"
                        preserveAspectRatio="none"
                      >
                        <motion.path
                          variants={{
                            hidden: {
                              pathLength: 0,
                            },
                            visible: {
                              pathLength: 1,
                              transition: {
                                delay: 3,
                              },
                            },
                          }}
                          stroke="#f9a8d4"
                          initial="hidden"
                          animate="visible"
                          strokeWidth={5}
                          strokeDasharray="1 1"
                          fill="none"
                          d="M118.273 6.09C79.243 4.558 40.297 5.459 1.305 9.034c-1.507.13-1.742-1.521-.199-1.81C39.81-.228 79.647-1.568 118.443 4.2c1.63.233 1.377 1.943-.17 1.1Z"
                        />
                      </motion.svg>
                    </em>,
                    // 'For',
                    // 'Your',
                    // 'Startup',
                  ]}
                ></TextGenerateEffect>
                {/* Custom{' '}
                <em className="inline-flex relative justify-center items-center italic text-zinc-900">
                  {' '}
                  GPT Agent
                  <svg
                    className="absolute fill-pink-300 w-[calc(100%+1rem)] -z-10"
                    xmlns="http://www.w3.org/2000/svg"
                    width="223"
                    height="62"
                    viewBox="0 0 223 62"
                    aria-hidden="true"
                    preserveAspectRatio="none"
                  >
                    <path d="M45.654 53.62c17.666 3.154 35.622 4.512 53.558 4.837 17.94.288 35.91-.468 53.702-2.54 8.89-1.062 17.742-2.442 26.455-4.352 8.684-1.945 17.338-4.3 25.303-7.905 3.94-1.81 7.79-3.962 10.634-6.777 1.38-1.41 2.424-2.994 2.758-4.561.358-1.563-.078-3.143-1.046-4.677-.986-1.524-2.43-2.96-4.114-4.175a37.926 37.926 0 0 0-5.422-3.32c-3.84-1.977-7.958-3.563-12.156-4.933-8.42-2.707-17.148-4.653-25.95-6.145-8.802-1.52-17.702-2.56-26.622-3.333-17.852-1.49-35.826-1.776-53.739-.978-8.953.433-17.898 1.125-26.79 2.22-8.887 1.095-17.738 2.541-26.428 4.616-4.342 1.037-8.648 2.226-12.853 3.676-4.197 1.455-8.314 3.16-12.104 5.363-1.862 1.13-3.706 2.333-5.218 3.829-1.52 1.47-2.79 3.193-3.285 5.113-.528 1.912-.127 3.965.951 5.743 1.07 1.785 2.632 3.335 4.348 4.68 2.135 1.652 3.2 2.672 2.986 3.083-.18.362-1.674.114-4.08-1.638-1.863-1.387-3.63-3.014-4.95-5.09C.94 35.316.424 34.148.171 32.89c-.275-1.253-.198-2.579.069-3.822.588-2.515 2.098-4.582 3.76-6.276 1.673-1.724 3.612-3.053 5.57-4.303 3.96-2.426 8.177-4.278 12.457-5.868 4.287-1.584 8.654-2.89 13.054-4.036 8.801-2.292 17.74-3.925 26.716-5.19C70.777 2.131 79.805 1.286 88.846.723c18.087-1.065 36.236-.974 54.325.397 9.041.717 18.07 1.714 27.042 3.225 8.972 1.485 17.895 3.444 26.649 6.253 4.37 1.426 8.697 3.083 12.878 5.243a42.11 42.11 0 0 1 6.094 3.762c1.954 1.44 3.823 3.2 5.283 5.485a12.515 12.515 0 0 1 1.63 3.88c.164.706.184 1.463.253 2.193-.063.73-.094 1.485-.247 2.195-.652 2.886-2.325 5.141-4.09 6.934-3.635 3.533-7.853 5.751-12.083 7.688-8.519 3.778-17.394 6.09-26.296 7.998-8.917 1.86-17.913 3.152-26.928 4.104-18.039 1.851-36.17 2.295-54.239 1.622-18.062-.713-36.112-2.535-53.824-6.23-5.941-1.31-5.217-2.91.361-1.852" />
                  </svg>
                </em>{' '}
                for your startup */}
              </motion.h1>
              <motion.p
                className="mx-auto mb-8 max-w-xl text-lg text-zinc-500 md:text-2xl"
                variants={childTextVariants}

                // custom={2}
              >
                <TextGenerateEffect
                  duration={0.5}
                  text={`Train a custom GPT chatbot on your data and let it handle support, lead generation, and more.`}
                  // text={`Turbocharge your creative process with a powerful AI design platform that gives creatives the power of creating without limits.`}
                ></TextGenerateEffect>
              </motion.p>

              <div className="flex flex-col space-y-6">
                <motion.div
                  className="mx-auto space-y-4 max-w-xs sm:max-w-none sm:inline-flex sm:justify-center sm:space-y-0 sm:space-x-4"
                  variants={makeVariants({
                    ...defaultContainerVariants,
                    visible: {
                      transition: {
                        staggerChildren: 0.2,
                      },
                    },
                  })}
                >
                  <motion.div
                    variants={defaultChildVariants}
                    //  custom={4}
                  >
                    <div>
                      <Link
                        className="w-full shadow btn text-zinc-100 bg-zinc-900 hover:bg-zinc-800"
                        href="https://app.chaindesk.ai/agents"
                      >
                        Start for free
                      </Link>
                    </div>
                  </motion.div>
                  <motion.div
                    variants={defaultChildVariants}
                    //  custom={4.2}
                  >
                    <a
                      className="w-full bg-white shadow btn text-zinc-600 hover:text-zinc-900"
                      href={config.demoBookingURL}
                      target="_blank"
                    >
                      Book a Demo
                    </a>
                  </motion.div>
                </motion.div>
                {/* <motion.div
                  variants={{
                    ...defaultChildVariants,
                    visible: {
                      ...defaultChildVariants.visible,
                      transition: {
                        delay: 2.5,
                      },
                    },
                  }}
                >
                  <TestimonialBadge />
                </motion.div> */}
              </div>
            </div>
          </div>
        </div>
        {/* Image */}
        <motion.div
          className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-center relative before:absolute before:-top-12 before:w-96 before:h-96 before:bg-zinc-900 before:opacity-[.15] before:rounded-full before:blur-3xl before:-z-10"
          variants={makeVariants({
            ...defaultChildVariants,
            visible: {
              ...defaultChildVariants.visible,
              transition: {
                delay: 2.5,
              },
            },
          })}
          // custom={4.7}
        >
          {/* <Image
            className="rounded-lg shadow-2xl"
            src={HeroImage}
            width={1104}
            height={620}
            alt="Hero"
            priority
          /> */}
          <iframe
            //   className="w-full h-[300px] rounded-2xl"
            //   width="560"
            className="w-full rounded-3xl aspect-video"
            src={`https://www.youtube.com/embed/-NkVS2l66Zs`}
            title="YouTube video player"
            frameBorder="0"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
          {/* https://www.youtube.com/watch?v=-NkVS2l66Zs */}
        </motion.div>
        {/* <div className="mt-12">
          <Stats />
        </div> */}
        {/* <Clients /> */}
      </motion.div>
    </section>
  );
}
