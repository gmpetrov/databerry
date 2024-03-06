import clsx from 'clsx';
import Image from 'next/image';

export function Logo(props) {
  return (
    <div
      className={clsx(
        'inline-flex relative items-center font-bold text-white space-x-1',
        props.className
      )}
    >
      <Image
        width="100"
        height="100"
        className={clsx(props.className)}
        src="/logo.png"
        alt=""
      />
      <span className="text-xl">Chaindesk</span>
      {/* <Image width="80" height="100" className={clsx(props.className)} src="/app-logo-dark-chatgpt.png" alt="" /> */}
    </div>
  );
}
