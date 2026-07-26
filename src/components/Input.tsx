/**
 * Input Components
 * Text, password, search, and select inputs
 */

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', onClick, onKeyDown, type, ...props }, ref) => {
    const isDateInput = type === 'date'

    const openDatePicker = (target: HTMLInputElement) => {
      if (!isDateInput) {
        return
      }

      const inputWithPicker = target as HTMLInputElement & {
        showPicker?: () => void
      }

      if (typeof inputWithPicker.showPicker === 'function') {
        try {
          inputWithPicker.showPicker()
        } catch {
          // Some browsers can block programmatic picker open; fall back to native behavior.
        }
      }
    }

    return (
      <div className="flex flex-col gap-2">
        {label && <label className="label text-text-secondary">{label}</label>}
        <input
          ref={ref}
          type={type}
          className={`input-base ${isDateInput ? 'date-input' : ''} ${error && 'border-danger focus:ring-danger'} ${className}`}
          onClick={(event) => {
            onClick?.(event)
            openDatePicker(event.currentTarget)
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event)

            if (!isDateInput) {
              return
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openDatePicker(event.currentTarget)
            }
          }}
          {...props}
        />
        {error && <span className="caption text-danger">{error}</span>}
        {helperText && <span className="caption text-text-secondary">{helperText}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface PasswordInputProps extends Omit<InputProps, 'type'> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    return <Input ref={ref} {...props} type="password" />
  }
)

PasswordInput.displayName = 'PasswordInput'

interface SearchInputProps extends Omit<InputProps, 'type'> {
  onSearch?: (value: string) => void
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onSearch?.(e.target.value)
    }

    return (
      <Input
        ref={ref}
        type="search"
        placeholder="Search..."
        onChange={handleChange}
        {...props}
      />
    )
  }
)

SearchInput.displayName = 'SearchInput'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string | number; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && <label className="label text-text-secondary">{label}</label>}
        <select
          ref={ref}
          className={`select ${error && 'border-danger focus:ring-danger'} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="caption text-danger">{error}</span>}
        {helperText && <span className="caption text-text-secondary">{helperText}</span>}
      </div>
    )
  }
)

Select.displayName = 'Select'
