import type { ButtonHTMLAttributes, Ref } from 'react'
import styles from './Button.module.css'

// main: the one red button per screen. secondary: outlined. quiet: underlined text.
type Variant = 'main' | 'secondary' | 'quiet'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  ref?: Ref<HTMLButtonElement>
}

export function Button({ variant = 'secondary', className, type = 'button', ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  return <button type={type} className={classes} {...rest} />
}
