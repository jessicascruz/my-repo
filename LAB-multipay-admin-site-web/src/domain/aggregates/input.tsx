import { TextField, Typography, Grid2, SxProps } from '@mui/material'
import { memo } from 'react'

interface InputFieldProps {
    label: string
    value: string
    isLink: boolean
    textFieldStyles: SxProps
}
export const InputField: React.FC<InputFieldProps> = memo(
    ({ label, value, isLink, textFieldStyles }) => (
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography fontWeight={600} sx={{ marginBottom: 1 }}>
                {label}
            </Typography>
            <TextField
                onClick={() => {
                    isLink ? window.open(value as string, '_blank') : null
                }}
                fullWidth
                value={value}
                InputProps={{
                    readOnly: true,
                    sx: {
                        ...textFieldStyles,
                        '& .MuiInputBase-input': {
                            cursor: isLink ? 'pointer' : 'default',
                        },
                        '& .MuiInputBase-input:hover': {
                            color: isLink ? '#0050D7' : null,
                        },
                    },
                }}
            />
        </Grid2>
    ),
    (prevProps, nextProps) =>
        prevProps.label === nextProps.label &&
        prevProps.value === nextProps.value &&
        prevProps.isLink === nextProps.isLink &&
        prevProps.textFieldStyles === nextProps.textFieldStyles
)