import { useId } from 'react'
import styles from './Form.module.css'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  help?: string
  placeholder?: string
  multiline?: boolean
  rows?: number
  narrow?: boolean
  required?: boolean
  autoFocus?: boolean
}

export function TextField({ label, value, onChange, help, placeholder, multiline, rows = 2, narrow, required, autoFocus }: TextFieldProps) {
  const id = useId()
  const helpId = `${id}-help`
  const shared = {
    id,
    value,
    placeholder,
    required,
    // Read by Dialog, which focuses this field once the pop-up has opened.
    'data-autofocus': autoFocus || undefined,
    'aria-describedby': help ? helpId : undefined,
    className: styles.input,
  }
  return (
    <div className={narrow ? styles.narrow : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} rows={rows} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...shared} type="text" onChange={(e) => onChange(e.target.value)} />
      )}
      {help && (
        <p id={helpId} className={styles.help}>
          {help}
        </p>
      )}
    </div>
  )
}

interface ChoiceProps<T extends string> {
  legend: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

// A row of buttons where exactly one is picked.
export function Choice<T extends string>({ legend, options, value, onChange }: ChoiceProps<T>) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.choices}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            className={styles.choice}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
