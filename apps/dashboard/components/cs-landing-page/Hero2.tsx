import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import RocketLaunchRounded from '@mui/icons-material/RocketLaunchRounded';
import Star from '@mui/icons-material/Star';
import Alert from '@mui/joy/Alert';
import Avatar from '@mui/joy/Avatar';
import AvatarGroup from '@mui/joy/AvatarGroup';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Container } from '@app/components/landing-page/Container';

import { appUrl } from '@chaindesk/lib/config';
import { CardBody, CardContainer, CardItem } from '@chaindesk/ui/3dCard';
import { BackgroundGradient } from '@chaindesk/ui/BackgroundGradient';

export default function Hero() {
  return (
    <>
      <div className="relative">
        {/* <div className="absolute top-0 z-0 inset-0 h-full pointer-events-none w-full bg-black bg-[linear-gradient(to_right,#80808022_1px,transparent_1px),linear-gradient(to_bottom,#80808022_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div> */}

        <Container className="relative z-10 pt-8 pb-16 mb-12 text-center lg:pt-10">
          {/* <img
        className="object-contain absolute left-0 bg-top opacity-60 -translate-y-1/4"
        src="https://nextsiders.vercel.app/_next/static/media/Hero.Gradient.0bce135c.svg"
        alt=""
      /> */}
          <div className="relative z-10">
            <div className="flex flex-col space-y-8 text-center sm:space-y-0 sm:flex-row sm:space-x-8 sm:text-left">
              <Stack sx={{ width: '100%' }}>
                {/* <svg
                  width="236"
                  height="68"
                  viewBox="0 0 236 68"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5 0.5H89C90.6569 0.5 92 1.84315 92 3.5V29C92 30.6569 93.3431 32 95 32H148.5C150.157 32 151.5 33.3431 151.5 35V64C151.5 65.6569 152.843 67 154.5 67H235.5"
                    stroke="url(#paint0_linear)"
                  ></path>
                  <defs>
                    <linearGradient
                      id="paint0_linear"
                      gradientUnits="userSpaceOnUse"
                      x1="225.65999999998894"
                      y1="0"
                      x2="328.92849999998543"
                      y2="42.849999999998545"
                    >
                      <stop stop-color="#2EB9DF" stop-opacity="0"></stop>
                      <stop stop-color="#2EB9DF"></stop>
                      <stop
                        offset="1"
                        stop-color="#9E00FF"
                        stop-opacity="0"
                      ></stop>
                    </linearGradient>
                  </defs>
                </svg> */}

                <div className="mb-12 font-bold inline-flex flex-wrap items-center gap-2 rounded-md border border-neutral-800/50 bg-neutral-900/60 py-[5px] pr-5 pl-2 text-xs leading-[0] text-neutral-300 backdrop-blur transition-all duration-300 hover:bg-neutral-900/80 sm:rounded-full mx-auto sm:mx-0 sm:mr-auto">
                  <span className="flex justify-center items-center px-2 py-3 font-extrabold uppercase bg-indigo-500 rounded-full">
                    <span>New</span>
                  </span>
                  <span className="inline-flex items-center">
                    <img
                      src="/integrations/whatsapp/icon.svg"
                      alt=""
                      className="mr-1 w-4 h-auto"
                    />
                    WhatsApp plugin
                  </span>

                  <Link
                    href="https://www.chaindesk.ai/help/whatsapp"
                    style={{ background: 'none' }}
                    className="text-[10px]underline-offset-4 text-indigo-300 text-main-hover flex items-center gap-2 font-medium transition-all hover:underline"
                    target="_blank"
                  >
                    Learn More{' '}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-arrow-narrow-right"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <line x1="15" y1="16" x2="19" y2="12"></line>
                      <line x1="15" y1="8" x2="19" y2="12"></line>
                    </svg>
                  </Link>
                </div>

                {/* <h2 className="mb-2 text-lg font-bold text-violet-300 sm:text-2xl sm:mb-4">
                  Get Your Own
                </h2> */}
                <h1 className="text-4xl font-bold !leading-tight tracking-tight  whitespace-pre-wrap  font-display sm:text-7xl relative text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-500">
                  {/* {`Custom\nGPT Agent\nFor Your Startup`} */}
                  {/* {`ChatGPT\nSupport Agent\nFor Your Startup`} */}
                  {/* {`Scale\nYour Startup\nWith AI At your side`} */}
                  {/* {`Custom\nGPT Agent\nFor Your Startup`} */}
                  {`Your Support\nOn Autopilot`}
                  {/* {`Customer Support\nOn Autopilot`} */}
                  {/* <span>AI Support</span>
                  {`\nFor Your Startup`} */}
                </h1>

                <div className="hidden flex-col mt-4 space-y-4 sm:flex">
                  <div className="inline-flex items-center space-x-2">
                    <CheckBadgeIcon className="w-5 h-5 text-green-400" />

                    {/* <TextGenerateEffect
                      words="Custom ChatGPT chatbot trained on your data"
                      className="mx-auto max-w-md font-medium tracking-tight text-gray-200 text-md sm:text-xl sm:mx-0 sm:max-w-lg"
                    ></TextGenerateEffect> */}
                    <p className="mx-auto max-w-md tracking-tight text-gray-200 text-md sm:text-xl sm:mx-0 sm:max-w-lg">
                      Custom ChatGPT chatbot trained on your data
                    </p>
                  </div>
                  {/* <div className="inline-flex items-center space-x-2">
                <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                <p className="mx-auto max-w-md tracking-tight text-gray-200 text-md sm:text-xl sm:mx-0 sm:max-w-lg">
                Proactive - Identify and resolve customer issues before they
                contact you
                </p>
              </div> */}
                  <div className="inline-flex items-center space-x-2">
                    <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                    <p className="mx-auto max-w-md tracking-tight text-gray-200 text-md sm:text-xl sm:mx-0 sm:max-w-lg">
                      Seamless human handoff
                    </p>

                    {/* <TextGenerateEffect
                      words="Seamless human handoff"
                      className="mx-auto max-w-md font-medium tracking-tight text-gray-200 text-md sm:text-xl sm:mx-0 sm:max-w-lg"
                    ></TextGenerateEffect> */}
                  </div>
                  <div className="inline-flex items-center space-x-2">
                    <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                    <p className="mx-auto max-w-md tracking-tight text-gray-200 text-md sm:text-xl sm:mx-0 sm:max-w-lg">
                      Shared Inbox for your team
                    </p>
                  </div>
                  {/* <div className="inline-flex items-center space-x-2">
                    <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                    <p className="mx-auto max-w-md tracking-tight text-gray-200 text-md sm:text-xl sm:mx-0 sm:max-w-lg">
                      No hallucinations or misleading answers
                    </p>
                  </div> */}

                  <div className="inline-flex items-center space-x-2">
                    <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                    <p className="mx-auto max-w-md tracking-tight text-gray-200 text-md sm:text-xl sm:mx-0 sm:max-w-lg">
                      Plug and play in minutes
                    </p>
                  </div>
                </div>
                {/* <p className="mx-auto mt-6 max-w-md text-lg tracking-tight text-gray-200 sm:mx-0 sm:max-w-lg">
              With our{' '}
              <strong className="text-violet-300">no-code platform</strong>, you
              can create a{' '}
              <strong className="text-violet-300">
              custom AI Autonomous Agent
              </strong>{' '}
              trained on your data in seconds.
            </p> */}

                <Box
                  className="justify-center sm:justify-start"
                  sx={(theme) => ({
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mt: 4,
                    // textAlign: 'left',
                    '& > *': {
                      flexShrink: 0,
                    },
                  })}
                >
                  <Stack gap={1}>
                    <Stack direction="row" gap={1}>
                      <Typography
                        className="w-full text-center sm:text-left"
                        fontSize="xl"
                        fontWeight="md"
                        // startDecorator={

                        // }
                      >
                        <React.Fragment>
                          <Star sx={{ color: 'warning.300' }} />
                          <Star sx={{ color: 'warning.300' }} />
                          <Star sx={{ color: 'warning.300' }} />
                          <Star sx={{ color: 'warning.300' }} />
                          <Star sx={{ color: 'warning.300' }} />
                        </React.Fragment>
                      </Typography>
                    </Stack>
                    <Typography textColor="text.secondary">
                      <b>+10K</b> companies have successfully <br></br>built
                      their custom AI Agent with Chaindesk
                    </Typography>
                  </Stack>
                </Box>

                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  gap={2}
                  mt={6}
                  className="justify-center sm:justify-start"
                >
                  <Stack>
                    <Link target="_blank" href={`${appUrl}/signin`}>
                      <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#603c96,45%,#ad93d4,55%,#603c96)] bg-[length:200%_100%] px-6 font-medium text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                        ⚡️ Get Started Now
                      </button>
                      {/* <Button

                 
                        variant="solid"
                        size="lg"
                        // startDecorator={<RocketLaunchRounded />}
                        sx={{ borderRadius: 100 }}
                      >{`⚡️ Get Started Now`}</Button> */}
                    </Link>
                    <p className="mt-2 text-sm italic text-center">
                      No credit card required
                    </p>
                  </Stack>
                  {/* <Link
                    target="_blank"
                    href={'https://calendar.app.google/js1tgwSh2CUvV4CA7'}
                  >
                    <Button
                      variant="outlined"
                      size="lg"
                      startDecorator={<PhoneRoundedIcon />}
                      sx={{ borderRadius: 100 }}
                    >
                      Book a Call
                    </Button>
                  </Link> */}
                </Stack>
              </Stack>

              <div className="flex flex-col justify-center items-center w-full sm:w-2/3">
                {/* <Image
                  src="/landing-page/inputs.png"
                  width="500"
                  height="150"
                  className="w-full"
                  alt="Datasources"
                /> */}
                <div className="flex overflow-visible justify-center items-center w-full bg-transparent rounded-3xl">
                  <CardContainer className="relative h-full inter-var">
                    <BackgroundGradient className="p-0">
                      <CardBody className="h-full bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] max-w-[400px] rounded-3xl px-6 py-2 border">
                        {/* <CardItem translateZ="70" className="w-full">
                          <Image
                            src="/landing-page/inputs.png"
                            width="500"
                            height="150"
                            className="w-full"
                            alt="Datasources"
                          />
                        </CardItem> */}
                        <CardItem translateZ="50" className="mt-2 w-full">
                          <Image
                            src="/images/messages/1.png"
                            width="1000"
                            height="150"
                            className="w-full"
                            alt="Datasources"
                          />
                        </CardItem>
                        <CardItem translateZ="100" className="mt-2 w-full">
                          <Image
                            src="/images/messages/2.png"
                            width="1000"
                            height="150"
                            className="w-full"
                            alt="Datasources"
                          />
                        </CardItem>
                        <CardItem translateZ="50" className="mt-2 w-full">
                          <Image
                            src="/images/messages/3.png"
                            width="1000"
                            height="150"
                            className="w-full"
                            alt="Datasources"
                          />
                        </CardItem>
                        <CardItem translateZ="100" className="mt-2 w-full">
                          <Image
                            src="/images/messages/4.png"
                            width="1000"
                            height="150"
                            className="w-full"
                            alt="Datasources"
                          />
                        </CardItem>
                        <CardItem translateZ="100" className="mt-2 w-full">
                          <Image
                            src="/images/messages/5.png"
                            width="1000"
                            height="150"
                            className="w-full"
                            alt="Datasources"
                          />
                        </CardItem>
                        <CardItem translateZ="100" className="mt-2 w-full">
                          <Image
                            src="/images/messages/6.png"
                            width="1000"
                            height="150"
                            className="w-full"
                            alt="Datasources"
                          />
                        </CardItem>
                        {/* <CardItem
                          translateZ="50"
                          className="text-xl font-bold text-neutral-600 dark:text-white"
                        >
                          Make things float in air
                        </CardItem> */}
                        {/* <CardItem
                          as="p"
                          translateZ="60"
                          className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-300"
                        >
                          Hover over this card to unleash the power of CSS
                          perspective
                        </CardItem> */}
                        {/* <CardItem translateZ="100" className="w-full">
                          <Image
                            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            height="1000"
                            width="1000"
                            className="object-cover w-full h-60 rounded-xl group-hover/card:shadow-xl"
                            alt="thumbnail"
                          />
                        </CardItem> */}

                        <div className="flex justify-center items-center mt-4 mb-4">
                          <a href={`${appUrl}/signin`} target="_blank">
                            <CardItem
                              translateZ={20}
                              as="button"
                              className="px-4 py-2 text-xs font-bold text-white bg-black rounded-xl dark:bg-white dark:text-black"
                            >
                              Install On Your Website →
                            </CardItem>
                          </a>
                        </div>
                      </CardBody>
                    </BackgroundGradient>
                  </CardContainer>

                  {/* <iframe
                    src={`${appUrl}/agents/clq6g5cuv000wpv8iddswwvnd/iframe`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="clipboard-write"
                  ></iframe> */}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
