import { styled, Typography } from '@mui/material'
import { Typography as AntDTypography, Tooltip } from 'antd'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

/**
 * Props for the CopyableTypography component
 * @interface CopyableTypographyProps
 * @property {string} [text] - The text content to be displayed. If not provided, an empty string will be shown.
 * @property {boolean} [emphasize=false] - Whether to emphasize the text with a darker background. Note: Currently not implemented.
 * @property {boolean} [copyable=false] - Whether to make the text copyable with a copy button. When true, adds a copy icon with tooltips in Portuguese.
 */
interface CopyableTypographyProps {
  /** The text content to be displayed */
  text?: string
  /** Whether to make the text copyable with a copy button */
  copyable?: boolean
  link?: boolean
}

const { Text } = AntDTypography

const StyledAnchor = styled('a')(({ theme }) => ({
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  marginLeft: '8px',
  ':hover': {
    color: `${theme.palette.primary.main}9e`,
  },
}))

/**
 * A typography component that combines Material-UI and Ant Design typography features.
 * Displays text in a styled container with optional copy functionality.
 *
 * @component
 * @param {CopyableTypographyProps} props - The component props
 * @param {string} [props.text] - The text content to be displayed
 * @param {boolean} [props.emphasize=false] - Whether to emphasize the text with a darker background
 * @param {boolean} [props.copyable=false] - Whether to make the text copyable with a copy button
 *
 * @example
 * // Basic usage with default styling
 * <CopyableTypography text="Hello World" />
 *
 * @example
 * // With copy functionality and Portuguese tooltips
 * <CopyableTypography
 *   text="Copy me"
 *   copyable
 * />
 *
 * @example
 * // With emphasis (currently not implemented)
 * <CopyableTypography
 *   text="Important text"
 *   emphasize
 * />
 *
 * @returns {JSX.Element} A Material-UI Typography component containing an Ant Design Text component
 *
 * @remarks
 * - Uses Material-UI Typography for the outer container
 * - Uses Ant Design Text component for copy functionality
 * - Applies a light gray background (#F5F5F5) with padding and rounded corners
 * - Copy tooltips are in Portuguese ("Copiar" / "Copiado!")
 */
const CopyableTypography = ({
  text,
  copyable = false,
  link,
}: CopyableTypographyProps) => {
  const styles = {
    text: {
      backgroundColor: '#F5F5F5',
      color: 'inherit',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 10px',
      borderRadius: '4px',
    },
    textCopyable: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '22px',
      color: 'inherit',
    },
  }
  return (
    <Typography variant="body1" style={styles.text}>
      <Text
        copyable={
          copyable
            ? {
                text,
                tooltips: ['Copiar', 'Copiado!'],
              }
            : false
        }
        style={styles.textCopyable}
      >
        {(text && text.length > 40 ? `${text.slice(0, 40)}...` : text) ?? ''}
      </Text>
      {link && (
        <Tooltip title="Abrir">
          <StyledAnchor
            href={String(text ?? '#')}
            {...(text && { target: '_blank' })}
            rel="noopener noreferrer"
          >
            <OpenInNewIcon sx={{ width: '16px' }} />
          </StyledAnchor>
        </Tooltip>
      )}
    </Typography>
  )
}

export default CopyableTypography
