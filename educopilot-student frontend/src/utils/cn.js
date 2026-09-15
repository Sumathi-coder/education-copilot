/**
 * Tiny classnames combinator — filters falsy values and joins the rest.
 * Keeps components free of a heavier dependency like clsx.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
