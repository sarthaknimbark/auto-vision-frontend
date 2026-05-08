import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const cardVariants = cva('rounded-3xl border p-6 transition-all', {
  variants: {
    variant: {
      default: 'glass-surface border-white/85',
      muted: 'glass-muted border-[#984216]/12',
      solid: 'bg-white border-[#111111]/7 shadow-[0_8px_20px_rgba(17,17,17,0.06)]',
    },
    spacing: {
      default: 'p-6 sm:p-7',
      compact: 'p-4 sm:p-5',
      roomy: 'p-8 sm:p-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    spacing: 'default',
  },
})

interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, spacing, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, spacing }), className)}
      {...props}
    />
  )
}
