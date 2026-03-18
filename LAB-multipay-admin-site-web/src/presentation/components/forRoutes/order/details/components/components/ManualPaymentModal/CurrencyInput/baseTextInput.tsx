import { TextField, TextFieldProps, Typography } from '@mui/material'
import { Ref, useEffect, useState } from 'react'

export type MuiTextFieldDesiredProps = Pick<
  TextFieldProps,
  | 'required'
  | 'error'
  | 'helperText'
  | 'value'
  | 'label'
  | 'onChange'
  | 'slotProps'
  | 'type'
  | 'placeholder'
  | 'inputRef'
  | 'variant'
  | 'disabled'
  | 'fullWidth'
  | 'size'
  | 'inputProps'
  | 'name'
>

export interface TextInputProps extends MuiTextFieldDesiredProps {
  adornment?: React.ReactNode
  loading?: boolean
  maxLength?: number
  LoadingComponent?: React.ComponentType
  ref?: Ref<HTMLInputElement>
  maskOptions?: {
    mask: string
    definitions?: { [key: string]: RegExp }
  }
}

export const BaseTextInput = ({
  value,
  onChange,
  ref,
  maxLength,
  ...props
}: TextInputProps) => {
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setCharCount(String(value || '').length)
  }, [value])

  const isAtLimit = maxLength && charCount >= maxLength
  return (
    <>
      <TextField
        variant="outlined"
        type="text"
        value={value}
        ref={ref}
        onChange={onChange}
        inputProps={{ maxLength: maxLength }}
        {...props}
        label={null}
        slotProps={
          props.adornment
            ? {
                input: {
                  startAdornment: props.adornment,
                },
              }
            : props.slotProps
        }
      />
      {isAtLimit && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: 'block',
            color: 'info.main',
            fontSize: '0.75rem',
            fontStyle: 'italic',
          }}
        >
          ✓ Limite de {maxLength} caracteres atingido
        </Typography>
      )}
    </>
  )
}
