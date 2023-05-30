import Link from 'next/link'

export function NavLink({ href, children, target }) {
  return (
    <Link
      href={href}
      target={target}
      className="inline-block px-2 py-1 text-sm text-gray-400 rounded-lg cursor-pointer hover:bg-dark-background-paper hover:text-white"
    >
      {children}
    </Link>
  )
}
