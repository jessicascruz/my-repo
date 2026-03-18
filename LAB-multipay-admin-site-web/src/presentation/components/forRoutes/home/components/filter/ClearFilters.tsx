import { useFilterContext } from '@/presentation/context/filter-context'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Grid2 as Grid } from '@mui/material'

const ClearFilter = () => {
    const { handleClearFilter, isEmptyFilter } = useFilterContext()

    return (
        <Grid>
            <Button
                data-testid="clear-filter-button"
                variant="outlined"
                onClick={handleClearFilter}
                sx={{
                    borderRadius: 2,
                }}
                startIcon={<Icon icon="mdi:times" />}
                disabled={isEmptyFilter}
                size="medium"
            >
                Limpar filtros
            </Button>
        </Grid>
    )
}

export { ClearFilter }
