import clsx from "clsx";

export function Logo(props) {
  return (
    <div className={clsx("inline-flex items-center font-bold text-white space-x-1", props.className)}>
      <img className={clsx(props.className)} src="/databerry-logo-icon.png" alt="" />
      <span className="text-xl">Databerry</span>
    </div>
  )
}
