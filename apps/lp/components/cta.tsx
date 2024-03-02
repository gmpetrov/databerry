import Image from 'next/image';
import Link from 'next/link';

import Logo from '@/public/images/logo.png';
import config from '@/utils/config';

export default function Features02() {
  return (
    <section>
      <div className="py-12 md:py-20">
        <div className="px-4 mx-auto max-w-6xl sm:px-6">
          <div className="relative pb-12 mx-auto max-w-3xl text-center md:pb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-xl shadow-md mb-8 relative before:absolute before:-top-12 before:w-52 before:h-52 before:bg-zinc-900 before:opacity-[.08] before:rounded-full before:blur-3xl before:-z-10">
              <Link href="/">
                <Image src={Logo} width={60} height={60} alt="Logo" />
              </Link>
            </div>
            <h2 className="mb-4 text-3xl font-bold font-bricolage-grotesque md:text-4xl text-zinc-900">
              Get your own AI Agent{' '}
              <em className="inline-flex relative justify-center items-end not-italic">
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
            <div className="mx-auto space-y-4 max-w-xs sm:max-w-none sm:inline-flex sm:justify-center sm:space-y-0 sm:space-x-4">
              <div>
                <a
                  className="w-full shadow btn text-zinc-100 bg-zinc-900 hover:bg-zinc-800"
                  href="https://app.chaindesk.ai/agents"
                >
                  Start For Free
                </a>
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
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Adobe"
                >
                  <path d="m21.966 31-1.69-4.231h-4.154l3.892-9.037L25.676 31h-3.71Zm-5.082-21H8v21l8.884-21ZM32 10h-8.884L32 31V10Z" />
                </svg>
              </li>
              <li className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Unsplash"
                >
                  <path d="M16.119 9h8.762v6.571h-8.762zM24.881 18.857H32V32H9V18.857h7.119v6.572h8.762z" />
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
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Windows"
                >
                  <path d="m8 11.408 9.808-1.335.004 9.46-9.803.056L8 11.41Zm9.803 9.215.008 9.47-9.803-1.348-.001-8.185 9.796.063Zm1.19-10.725L31.996 8v11.413l-13.005.103V9.898ZM32 20.712l-.003 11.362-13.005-1.835-.018-9.548L32 20.712Z" />
                </svg>
              </li>
              <li className="m-2 p-4 relative rounded-lg border border-transparent [background:linear-gradient(theme(colors.zinc.50),theme(colors.zinc.50))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box]">
                <svg
                  className="fill-zinc-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  aria-label="Pinterest"
                >
                  <path d="M19.482 6.455c-7.757 0-14.045 6.288-14.045 14.045 0 5.95 3.702 11.032 8.926 13.079-.123-1.112-.233-2.816.05-4.03.254-1.095 1.646-6.98 1.646-6.98s-.42-.842-.42-2.086c0-1.953 1.132-3.41 2.541-3.41 1.198 0 1.777.899 1.777 1.978 0 1.205-.767 3.006-1.163 4.676-.33 1.398.701 2.538 2.08 2.538 2.496 0 4.415-2.632 4.415-6.431 0-3.363-2.416-5.714-5.867-5.714-3.996 0-6.342 2.997-6.342 6.095 0 1.207.466 2.501 1.046 3.205a.42.42 0 0 1 .097.403c-.107.443-.343 1.397-.39 1.592-.061.258-.204.312-.47.188-1.754-.816-2.85-3.38-2.85-5.44 0-4.431 3.218-8.5 9.28-8.5 4.872 0 8.658 3.472 8.658 8.112 0 4.84-3.052 8.736-7.288 8.736-1.423 0-2.761-.74-3.22-1.613l-.874 3.339c-.317 1.22-1.173 2.749-1.746 3.682a14.04 14.04 0 0 0 4.159.626c7.757 0 14.045-6.288 14.045-14.045S27.238 6.455 19.482 6.455Z" />
                </svg>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
