import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { removeCharacters } from '@/domain/seedWork/utils/removeCharacters'
import { removeLetters } from '@/domain/seedWork/utils/removeLetters'
import { TextField, TextFieldProps } from '@mui/material'
import { forwardRef, useState } from 'react'

/**
 * Props interface for the MonetaryInput component
 * @interface MonetaryInputProps
 * @extends {Omit<TextFieldProps, 'onChange'>}
 */
interface MonetaryInputProps extends Omit<TextFieldProps, 'onChange'> {
  /** The current value of the input in Brazilian currency format (e.g., 'R$ 1.234,56') */
  value: string
  /** Callback function that is called when the input value changes */
  onChange: (value: string) => void
  /** The label text to be displayed above the input field */
  label: string
  /** The maximum value of the input field */
  maxValue?: number
}

/**
 * A specialized input component for handling monetary values in Brazilian currency format (BRL).
 * This component automatically formats the input value as currency and handles numeric validation.
 *
 * Features:
 * - Automatic currency formatting in BRL format (R$ X.XXX,XX)
 * - Maximum value validation with error state
 * - Handles zero value edge case
 * - Removes non-numeric characters automatically
 * - Displays helper text when maximum value is exceeded
 *
 * @component
 * @param {MonetaryInputProps} props - The component props
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the underlying TextField component
 * @returns {JSX.Element} A TextField component configured for monetary input
 *
 * @example
 * ```tsx
 * <MonetaryInput
 *   value="R$ 1.234,56"
 *   onChange={(newValue) => setValue(newValue)}
 *   label="VALUE"
 *   maxValue={10000}
 * />
 * ```
 */

export const MonetaryInput = forwardRef<HTMLDivElement, MonetaryInputProps>(
  ({ value, onChange, label, maxValue, ...props }, ref) => {
    const [isMaxValue, setIsMaxValue] = useState(false)
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value

      // Handle special case for zero value
      if (inputValue === 'R$ 0,0') {
        inputValue = 'R$ 0,00'
        onChange(inputValue)
        return
      }

      const cleanValue = removeCharacters(inputValue)
      const onlyNumbers = removeLetters(cleanValue)
      const numberValue = Number(onlyNumbers) / 100

      // Handle max value validation
      if (maxValue && numberValue > maxValue) {
        setIsMaxValue(true)
        inputValue = maxValue.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        })
      } else {
        setIsMaxValue(false)
        inputValue = numberValue.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        })
      }

      onChange(inputValue)
    }

    return (
      <TextField
        label={label}
        error={isMaxValue}
        ref={ref}
        value={value}
        onChange={handleChange}
        helperText={
          isMaxValue && maxValue
            ? `O valor máximo é de ${formatToBrlCurrency(maxValue)}`
            : ''
        }
        {...props}
      />
    )
  }
)
