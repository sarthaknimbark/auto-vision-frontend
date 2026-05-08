import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-2xl border border-[#111111]/8 bg-white/75 px-4 text-sm font-medium text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none backdrop-blur-xl transition-all placeholder:text-[#4B4B4B]/55 focus:border-[#984216]/35 focus:bg-white focus:shadow-[0_0_0_4px_rgba(152,66,22,0.10)]',
        className,
      )}
      {...props}
    />
  )
}
