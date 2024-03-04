import React from 'react';

type Props = {
  children?: React.ReactNode;
};

export default function Section(props: Props) {
  return (
    <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
      <div className="pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="px-4 mx-auto max-w-6xl text-center sm:px-6">
          {props.children}
        </div>
      </div>
    </section>
  );
}
