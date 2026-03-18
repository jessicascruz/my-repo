import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Typography,
} from '@mui/material'
import { GridExpandMoreIcon } from '@mui/x-data-grid'
import Image from 'next/image'
import { ReactNode } from 'react'

interface Props {
  title: string
  imagePath?: string
  dataLength: number
  children: ReactNode | ReactNode[]
  expanded?: boolean
  onChange: (param: boolean) => void
}

export const CollapsableListAccordion = ({
  children,
  title,
  dataLength,
  imagePath,
  expanded,
  onChange,
}: Props) => {
  return (
    dataLength > 0 && (
      <Accordion
        expanded={expanded}
        onChange={(_, expanded) => {
          onChange(expanded)
        }}
        elevation={0}
        sx={{ boxShadow: 'none', border: 'none', mb: 0 }}
      >
        <AccordionSummary
          expandIcon={<GridExpandMoreIcon />}
          sx={{ backgroundColor: '#F6F6F6', color: '#1F1F1F', marginTop: 2 }}
        >
          <Badge color="primary" badgeContent={dataLength}>
            <Box display="flex" alignItems="center">
              <Typography variant="h6">{title}</Typography>
              {imagePath && (
                <Image
                  src={imagePath}
                  alt={title}
                  width={30}
                  height={30}
                  style={{ marginRight: 10, marginLeft: 10 }}
                />
              )}
            </Box>
          </Badge>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: '#fff', color: '#1F1F1F' }}>
          {children}
        </AccordionDetails>
      </Accordion>
    )
  )
}
