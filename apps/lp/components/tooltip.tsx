'use client';

import { Transition } from '@headlessui/react';
import { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  id: string;
  dark?: boolean;
}

export default function Tooltip({
  children,
  content,
  id,
  dark = false,
}: TooltipProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <button
        className={`block text-left underline decoration-dotted underline-offset-4 cursor-help ${
          dark
            ? 'decoration-zinc-600 text-zinc-400'
            : 'decoration-zinc-300 text-zinc-500'
        }`}
        aria-describedby={`tooltip-${id}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </button>
      <div
        id={`tooltip-${id}`}
        role="tooltip"
        className="absolute left-0 top-full z-10"
      >
        <Transition
          show={open}
          className="w-[12.5rem] text-xs bg-white text-zinc-500 border border-zinc-200 px-3 py-2 rounded shadow-lg overflow-hidden mt-1"
          enter="transition ease-out duration-200 transform"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {content}
        </Transition>
      </div>
    </div>
  );
}
