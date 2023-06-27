import clsx from "clsx";
import Image from "next/image";

export function Logo(props) {
  return (
    <div className={clsx("inline-flex items-center font-bold text-white space-x-1", props.className)}>
      <Image width="100" height="100" className={clsx(props.className)} src="/app-logo-icon.png" alt="" />
      <span className="text-xl">Chaindesk</span>
    </div>
  )
}
