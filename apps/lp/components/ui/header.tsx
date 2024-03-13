'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import LinkWithUTMFromPath from '@chaindesk/ui/LinkWithUTMFromPath';

import Menu from './products-menu';

import Logo from '@/public/images/logo.png';

export default function Header() {
  return (
    <header className="absolute top-2 z-30 w-full md:top-6">
      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between h-14 border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg px-3">
            {/* Site branding */}
            <LinkWithUTMFromPath
              className="inline-flex items-center mr-4 space-x-2 shrink-0"
              href={`/`}
            >
              {/* Logo */}
              <div className="flex justify-center items-center w-8 h-8 bg-white rounded shadow-sm shadow-zinc-950/20">
                <Image src={Logo} width={24} height={24} alt="Logo" />
              </div>
              <span className="text-lg font-bold font-bricolage-grotesque">
                Chaindesk
              </span>
            </LinkWithUTMFromPath>

            {/* Desktop navigation */}
            <nav className="flex grow">
              {/* Desktop sign in links */}
              <ul className="flex flex-wrap justify-end items-center grow">
                <li>
                  <Link
                    className="hidden items-center px-3 py-2 text-sm font-medium transition md:flex text-zinc-500 hover:text-zinc-900 lg:px-5"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
                <li className="hidden px-3 md:flex lg:px-5">
                  <Menu />
                </li>

                <li>
                  <Link
                    className="hidden items-center px-3 py-2 text-sm font-medium transition md:flex text-zinc-500 hover:text-zinc-900 lg:px-5"
                    href="/integrations"
                  >
                    Integrations
                  </Link>
                </li>

                <li>
                  <Link
                    className="hidden items-center px-3 py-2 text-sm font-medium transition md:flex text-zinc-500 hover:text-zinc-900 lg:px-5"
                    href="https://databerry.getrewardful.com/"
                    target="_blank"
                  >
                    Affiliates
                  </Link>
                </li>

                <li>
                  <LinkWithUTMFromPath
                    className="hidden items-center px-3 py-2 text-sm font-medium transition md:flex text-zinc-500 hover:text-zinc-900 lg:px-5"
                    href={`https://app.chaindesk.ai/signin`}
                  >
                    Log in
                  </LinkWithUTMFromPath>
                </li>

                <li className="ml-1">
                  <LinkWithUTMFromPath
                    className="hidden w-full shadow sm:flex btn-sm text-zinc-100 bg-zinc-900 hover:bg-zinc-800"
                    href={`https://app.chaindesk.ai/signin`}
                  >
                    Sign up for free
                  </LinkWithUTMFromPath>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
