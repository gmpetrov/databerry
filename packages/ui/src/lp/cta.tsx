'use client';
import Image from 'next/image';
import Link from 'next/link';

import LinkWithUTMFromPath from '@chaindesk/ui/LinkWithUTMFromPath';

// import Logo from '@/public/images/logo.png';
import config from '@chaindesk/lib/config';

export default function Features02() {
  return (
    <section>
      <div className="py-12 md:py-20">
        <div className="max-w-6xl px-4 mx-auto sm:px-6">
          <div className="relative max-w-3xl pb-12 mx-auto text-center md:pb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-xl shadow-md mb-8 relative before:absolute before:-top-12 before:w-52 before:h-52 before:bg-zinc-900 before:opacity-[.08] before:rounded-full before:blur-3xl before:-z-10">
              <Link href="/">
                <Image
                  src={'/images/logo.png'}
                  width={60}
                  height={60}
                  alt="Logo"
                />
              </Link>
            </div>
            <h2 className="mb-4 text-3xl font-bold font-bricolage-grotesque md:text-4xl text-zinc-900">
              Get your own AI Agent{' '}
              <em className="relative inline-flex items-end justify-center not-italic">
                Today
                <svg
                  className="absolute fill-zinc-300 w-[calc(100%+1rem)] -z-10"
                  xmlns="http://www.w3.org/2000/svg"
                  width="120"
                  height="10"
                  viewBox="0 0 120 10"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path d="M118.273 6.09C79.243 4.558 40.297 5.459 1.305 9.034c-1.507.13-1.742-1.521-.199-1.81C39.81-.228 79.647-1.568 118.443 4.2c1.63.233 1.377 1.943-.17 1.89Z" />
                </svg>
              </em>
            </h2>
            <p className="mb-8 text-lg text-zinc-500">
              {`Thousands of businesses worldwide are using Chaindesk Generative
              AI platform.`}
              <br></br>
              {`Don't get left behind - start building your
              own custom AI chatbot now!`}
            </p>
            <div className="max-w-xs mx-auto space-y-4 sm:max-w-none sm:inline-flex sm:justify-center sm:space-y-0 sm:space-x-4">
              <div>
                <LinkWithUTMFromPath
                  className="w-full shadow btn text-zinc-100 bg-zinc-900 hover:bg-zinc-800"
                  href={`https://app.chaindesk.ai/agents`}
                >
                  Start For Free
                </LinkWithUTMFromPath>
              </div>
              <div>
                <a
                  className="w-full bg-white shadow btn text-zinc-600 hover:text-zinc-900"
                  href={config.demoBookingURL}
                  target="_blank"
                >
                  Book a Demo
                </a>
              </div>
            </div>
          </div>
          {/* Clients */}
          <div className="text-center">
            <ul className="inline-flex flex-wrap items-center justify-center -m-2 [mask-image:linear-gradient(to_right,transparent_8px,_theme(colors.white/70)_64px,_theme(colors.white)_50%,_theme(colors.white/70)_calc(100%-64px),_transparent_calc(100%-8px))]">
              <li className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="fill-zinc-400"
                  width="40"
                  height="40"
                  aria-label="Zapier"
                >
                  <g>
                    <path
                      d="M128.080089,-0.000183105 C135.311053,0.0131003068 142.422517,0.624138494 149.335663,1.77979593 L149.335663,1.77979593 L149.335663,76.2997796 L202.166953,23.6044907 C208.002065,27.7488446 213.460883,32.3582023 218.507811,37.3926715 C223.557281,42.4271407 228.192318,47.8867213 232.346817,53.7047992 L232.346817,53.7047992 L179.512985,106.400063 L254.227854,106.400063 C255.387249,113.29414 256,120.36111 256,127.587243 L256,127.587243 L256,127.759881 C256,134.986013 255.387249,142.066204 254.227854,148.960282 L254.227854,148.960282 L179.500273,148.960282 L232.346817,201.642324 C228.192318,207.460402 223.557281,212.919983 218.523066,217.954452 L218.523066,217.954452 L218.507811,217.954452 C213.460883,222.988921 208.002065,227.6115 202.182208,231.742607 L202.182208,231.742607 L149.335663,179.04709 L149.335663,253.5672 C142.435229,254.723036 135.323765,255.333244 128.092802,255.348499 L128.092802,255.348499 L127.907197,255.348499 C120.673691,255.333244 113.590195,254.723036 106.677048,253.5672 L106.677048,253.5672 L106.677048,179.04709 L53.8457596,231.742607 C42.1780766,223.466917 31.977435,213.278734 23.6658953,201.642324 L23.6658953,201.642324 L76.4997269,148.960282 L1.78485803,148.960282 C0.612750404,142.052729 0,134.946095 0,127.719963 L0,127.719963 L0,127.349037 C0.0121454869,125.473817 0.134939797,123.182933 0.311311815,120.812834 L0.36577283,120.099764 C0.887996182,113.428547 1.78485803,106.400063 1.78485803,106.400063 L1.78485803,106.400063 L76.4997269,106.400063 L23.6658953,53.7047992 C27.8076812,47.8867213 32.4300059,42.4403618 37.4769335,37.4193681 L37.4769335,37.4193681 L37.5023588,37.3926715 C42.5391163,32.3582023 48.0106469,27.7488446 53.8457596,23.6044907 L53.8457596,23.6044907 L106.677048,76.2997796 L106.677048,1.77979593 C113.590195,0.624138494 120.688946,0.0131003068 127.932622,-0.000183105 L127.932622,-0.000183105 L128.080089,-0.000183105 Z M128.067377,95.7600714 L127.945335,95.7600714 C118.436262,95.7600714 109.32891,97.5001809 100.910584,100.661566 C97.7553011,109.043534 96.0085811,118.129275 95.9958684,127.613685 L95.9958684,127.733184 C96.0085811,137.217594 97.7553011,146.303589 100.923296,154.685303 C109.32891,157.846943 118.436262,159.587052 127.945335,159.587052 L128.067377,159.587052 C137.576449,159.587052 146.683802,157.846943 155.089415,154.685303 C158.257411,146.290368 160.004131,137.217594 160.004131,127.733184 L160.004131,127.613685 C160.004131,118.129275 158.257411,109.043534 155.089415,100.661566 C146.683802,97.5001809 137.576449,95.7600714 128.067377,95.7600714 Z"
                      fillRule="nonzero"
                    ></path>
                  </g>
                </svg>
              </li>

              <li className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Google"
                >
                  <path d="M8.407 26.488a13.458 13.458 0 0 1 0-11.98A13.48 13.48 0 0 1 29.63 10.57l-4.012 3.821a7.934 7.934 0 0 0-5.12-1.87 7.986 7.986 0 0 0-7.568 5.473 7.94 7.94 0 0 0-.408 2.504A7.94 7.94 0 0 0 12.93 23a7.986 7.986 0 0 0 7.567 5.472 8.577 8.577 0 0 0 4.566-1.127l4.489 3.459a13.415 13.415 0 0 1-9.055 3.19 13.512 13.512 0 0 1-12.09-7.507Zm25.036-8.444c.664 6.002-1.021 10.188-3.89 12.762l-4.488-3.46a6.581 6.581 0 0 0 2.795-3.78h-7.301v-5.522h12.884Z" />
                </svg>
              </li>

              <li className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 175.216 175.552"
                  className="fill-zinc-400"
                  width="40"
                  height="40"
                  aria-label="WhatsApp"
                >
                  <defs>
                    <linearGradient
                      id="b"
                      x1="85.915"
                      x2="86.535"
                      y1="32.567"
                      y2="137.092"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0" stopColor="#a1a1aa" />
                      <stop offset="1" stopColor="#a1a1aa" />
                    </linearGradient>
                    <filter
                      id="a"
                      width="1.115"
                      height="1.114"
                      x="-.057"
                      y="-.057"
                      colorInterpolationFilters="sRGB"
                    >
                      <feGaussianBlur stdDeviation="3.531" />
                    </filter>
                  </defs>
                  <path
                    fill="#b3b3b3"
                    d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
                    filter="url(#a)"
                  />
                  <path
                    fill="#fff"
                    d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
                  />
                  <path
                    fill="url(#linearGradient1780)"
                    d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"
                  />
                  <path
                    fill="url(#b)"
                    d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
                  />
                  <path
                    fill="#fff"
                    fillRule="evenodd"
                    d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
                  />
                </svg>
              </li>

              <li className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                <svg
                  viewBox="0 0 100 100"
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Notion"
                >
                  <path
                    d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
                    fill="#fff"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
                  />
                </svg>
              </li>
              <li className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="WordPress"
                >
                  <path d="M8.061 20.5c0-1.804.387-3.516 1.077-5.063l5.934 16.257c-4.15-2.016-7.01-6.271-7.01-11.194Zm20.836-.628c0 1.065-.41 2.3-.946 4.021L26.71 28.04l-4.496-13.371c.749-.04 1.424-.119 1.424-.119.67-.079.591-1.064-.08-1.025 0 0-2.014.158-3.315.158-1.222 0-3.276-.158-3.276-.158-.67-.039-.75.986-.079 1.025 0 0 .635.08 1.305.119l1.938 5.31-2.723 8.163-4.53-13.473c.75-.04 1.424-.119 1.424-.119.67-.079.591-1.064-.08-1.025 0 0-2.014.158-3.314.158-.234 0-.509-.005-.801-.015A12.425 12.425 0 0 1 20.5 8.061c3.238 0 6.187 1.238 8.4 3.266-.054-.004-.106-.01-.162-.01-1.221 0-2.088 1.064-2.088 2.207 0 1.025.591 1.893 1.221 2.918.474.828 1.026 1.892 1.026 3.43Zm-8.179 1.716 3.824 10.475c.025.061.056.118.089.171a12.434 12.434 0 0 1-7.645.198l3.732-10.844Zm10.697-7.056a12.378 12.378 0 0 1 1.524 5.968c0 4.589-2.487 8.595-6.185 10.751l3.799-10.985c.71-1.774.946-3.193.946-4.455 0-.458-.03-.883-.084-1.279ZM20.5 6C28.495 6 35 12.504 35 20.5 35 28.495 28.495 35 20.5 35S6 28.495 6 20.5C6 12.504 12.505 6 20.5 6Zm0 28.335c7.628 0 13.835-6.207 13.835-13.835 0-7.629-6.207-13.835-13.835-13.835-7.629 0-13.835 6.206-13.835 13.835 0 7.628 6.206 13.835 13.835 13.835Z" />
                </svg>
              </li>
              <li className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                <svg
                  viewBox="0 0 130 130"
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Notion"
                >
                  <path
                    d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z"
                    // fill="#E01E5A"
                  />
                  <path
                    d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z"
                    // fill="#36C5F0"
                  />
                  <path
                    d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z"
                    // fill="#2EB67D"
                  />
                  <path
                    d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z"
                    // fill="#ECB22E"
                  />
                </svg>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
