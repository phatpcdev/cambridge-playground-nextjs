import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export function variantCn<T extends string | number | symbol = string>(
  variant: T,
  mapping: Record<T, string>,
) {
  return mapping[variant] || ''
}
