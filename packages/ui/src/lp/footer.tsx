import Image from 'next/image';
import Link from 'next/link';

import competitors from '@chaindesk/lib/data/competitors';
import integrations from '@chaindesk/lib/data/integrations';
import products from '@chaindesk/lib/data/products';
import slugify from '@chaindesk/lib/slugify';

// import Logo from '@/public/images/logo.png';

export default function Footer() {
  return (
    <footer>
      <div className="max-w-6xl px-4 mx-auto sm:px-6">
        {/* Top area: Blocks */}
        <div className="grid gap-8 py-8 border-t sm:grid-cols-12 md:py-12 border-zinc-200">
          {/* 1st block */}
          <div className="flex flex-col sm:col-span-6 md:col-span-2 lg:col-span-2 max-sm:order-1">
            <div className="mb-4">
              {/* Logo */}
              <a
                className="flex items-center justify-center w-8 h-8 bg-white rounded shadow-sm shadow-zinc-950/20"
                href="/"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_LANDING_PAGE_URL}/images/logo.png`}
                  width={24}
                  height={24}
                  alt="Logo"
                />
              </a>
            </div>
            <div className="text-sm text-zinc-500">
              &copy; Chaindesk All rights reserved.
            </div>
            {/* Social links */}
            <ul className="flex mt-4 mb-1 space-x-4">
              <li>
                <a
                  className="flex items-center justify-center transition text-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-400 dark:text-zinc-300 dark:hover:text-zinc-100"
                  href="https://twitter.com/@chaindesk_ai"
                  aria-label="Twitter"
                  target="_blank"
                >
                  <svg
                    className="fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="m7.063 3 3.495 4.475L14.601 3h2.454l-5.359 5.931L18 17h-4.938l-3.866-4.893L4.771 17H2.316l5.735-6.342L2 3h5.063Zm-.74 1.347H4.866l8.875 11.232h1.36L6.323 4.347Z" />
                  </svg>
                </a>
              </li>
              {/* <li>
                <a
                  className="flex items-center justify-center transition text-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-400 dark:text-zinc-300 dark:hover:text-zinc-100"
                  href="#0"
                  aria-label="Medium"
                >
                  <svg
                    className="fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="M17 2H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Zm-1.708 3.791-.858.823a.251.251 0 0 0-.1.241V12.9a.251.251 0 0 0 .1.241l.838.823v.181h-4.215v-.181l.868-.843c.085-.085.085-.11.085-.241V7.993L9.6 14.124h-.329l-2.81-6.13V12.1a.567.567 0 0 0 .156.472l1.129 1.37v.181h-3.2v-.181l1.129-1.37a.547.547 0 0 0 .146-.472V7.351A.416.416 0 0 0 5.683 7l-1-1.209V5.61H7.8l2.4 5.283 2.122-5.283h2.971l-.001.181Z" />
                  </svg>
                </a>
              </li> */}
              <li>
                <a
                  className="flex items-center justify-center transition text-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-400 dark:text-zinc-300 dark:hover:text-zinc-100"
                  href="https://www.linkedin.com/company/chaindesk"
                  aria-label="Linkedin"
                  target="_blank"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="fill-current"
                    width="20"
                    height="20"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="flex items-center justify-center transition text-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-400 dark:text-zinc-300 dark:hover:text-zinc-100"
                  href="https://discord.gg/FSWKj49ckX"
                  aria-label="Discord"
                  target="_blank"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 127.14 96.36"
                    className="fill-current"
                    width="20"
                    height="20"
                  >
                    <g id="图层_2" data-name="图层 2">
                      <g id="Discord_Logos" data-name="Discord Logos">
                        <g
                          id="Discord_Logo_-_Large_-_White"
                          data-name="Discord Logo - Large - White"
                        >
                          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                        </g>
                      </g>
                    </g>
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-12 sm:col-span-10 md:col-span-10 lg:col-span-10">
            {/* 2nd block */}
            <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h6 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Products
              </h6>
              <ul className="space-y-2 text-sm">
                {products.map((product) => (
                  <li key={product?.slug}>
                    <a
                      className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                      href={`/products/${product?.slug}`}
                    >
                      {product?.name}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href={`/integrations`}
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href={`/pricing`}
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            {/* <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h6 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Use Cases
              </h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="#0"
                  >
                    About us
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="#0"
                  >
                    Diversity & Inclusion
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="#0"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="#0"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="#0"
                  >
                    Financial statements
                  </a>
                </li>
              </ul>
            </div> */}

            {/* 3rd block */}
            <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h6 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Free Tools
              </h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="/tools/youtube-summarizer"
                  >
                    Free YouTube Video Summarizer
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="/ai-news"
                  >
                    AI News
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://www.funfun.tools/?via=chaindesk"
                    target="_blank"
                  >
                    AI Tool Directory
                  </a>
                </li>
              </ul>
            </div>

            {/* 4th block */}
            <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h6 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Help & Support
              </h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://docs.chaindesk.ai/"
                    target="_blank"
                  >
                    Documentation
                  </a>
                </li>
                {/* <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://chaindesk.ai/help"
                    target="_blank"
                  >
                    Help Center
                  </a>
                </li> */}
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://www.chaindesk.ai/blog"
                    target="_blank"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://docs.chaindesk.ai/privacy/gdpr"
                    target="_blank"
                  >
                    GDPR
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://docs.chaindesk.ai/privacy/privacy-policy"
                    target="_blank"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://docs.chaindesk.ai/privacy/terms"
                    target="_blank"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            {/* 5th block */}
            <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h6 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Community
              </h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://databerry.getrewardful.com/"
                    target="_blank"
                  >
                    Affiliates
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://github.com/gmpetrov/databerry"
                    target="_blank"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                    href="https://discord.gg/FSWKj49ckX"
                    target="_blank"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h6 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Add To
              </h6>
              <ul className="space-y-2 text-sm">
                {integrations
                  .filter((each) => each.isChannel)
                  .map((integration) => (
                    <li key={integration?.slug}>
                      <a
                        className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                        href={`/integrations/${integration?.slug}`}
                      >
                        Add AI chatbot to {integration?.name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h6 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Chat with
              </h6>
              <ul className="space-y-2 text-sm">
                {integrations
                  .filter((each) => each.isDatasource)
                  .map((integration) => (
                    <li key={integration?.slug}>
                      <a
                        className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                        href={`/integrations/${integration?.slug}`}
                      >
                        Chat with {integration?.name}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
              <h6 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Compare
              </h6>
              <ul className="space-y-2 text-sm">
                {competitors.map((name) => (
                  <li key={name}>
                    <a
                      className="transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400"
                      href={`/compare/${slugify(name)}-alternative`}
                    >
                      {`${name} alternative`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
