import { FormLabel, Stack } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form'
import { BaseTextInput, TextInputProps } from './baseTextInput'

interface ControlledMoneyInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>
  extends
    UseControllerProps<TFieldValues, TName>,
    Omit<TextInputProps, 'name' | 'defaultValue' | 'value'> {
  helperTextFormatter?: (value?: string) => string
  onValueChange?: (value: string) => void
}

export const MoneyInput = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  helperTextFormatter,
  onValueChange,
  ...props
}: ControlledMoneyInputProps<TFieldValues, TName>) => {
  const { field, fieldState } = useController({ name, control })

  const [displayValue, setDisplayValue] = useState<string>('')

  // Atualiza displayValue quando o valor do form mudar (ex: reset)
  useEffect(() => {
    if (field.value == null || isNaN(Number(field.value))) {
      setDisplayValue('')
      return
    }
    const formatted = formatNumberToDisplay(Number(field.value))
    setDisplayValue(formatted)
  }, [field.value])

  const formatNumberToDisplay = (num: number) => {
    const valueInCents = Math.round(num * 100)
    const stringValue = valueInCents.toString().padStart(3, '0') // garante pelo menos 3 dígitos
    const integerPart = stringValue.slice(0, -2)
    const decimalPart = stringValue.slice(-2)
    return `${Number(integerPart).toLocaleString()},${decimalPart}`
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')
    const numericValue = parseInt(onlyNumbers || '0', 10)
    const finalValue = numericValue / 100

    // Atualiza display
    const integerPart = Math.floor(numericValue / 100)
    const decimalPart = (numericValue % 100).toString().padStart(2, '0')
    setDisplayValue(`${integerPart.toLocaleString()},${decimalPart}`)

    // Atualiza o form com valor real

    field.onChange(finalValue)

    // Chama o onChange personalizado se existir
    if (onValueChange) {
      onValueChange(String(finalValue))
    }
  }

  const formErrorMessage = fieldState.error?.message
  const formattedHelperText = helperTextFormatter
    ? helperTextFormatter(String(field.value ?? ''))
    : null

  return (
    <Stack>
      <FormLabel sx={{ mb: 0.5, fontWeight: 500 }}>Valor</FormLabel>
      <BaseTextInput
        {...props}
        value={displayValue}
        onChange={handleChange}
        inputProps={{ inputMode: 'numeric' }}
        error={!!formErrorMessage}
        helperText={formErrorMessage || formattedHelperText}
        placeholder="0,00"
      />
    </Stack>
  )
}
