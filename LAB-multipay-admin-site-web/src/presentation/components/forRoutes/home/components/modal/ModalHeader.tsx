import { Icon } from '@iconify/react';
import { Grid2 as Grid, IconButton, Typography } from '@mui/material';
import React from 'react';

interface Props {
    title?: string;
    handleClose: () => void;
}

const ModalHeader = ({ title, handleClose }: Props) => {
    return (
        <Grid
            container
            size={12}
            justifyContent={title ? 'space-between' : 'end'}
            alignItems={'center'}
        >
            {title && (
                <Grid alignItems={'center'}>
                    <Typography
                        id="modal-modal-title"
                        variant="h6"
                        color={'primary'}
                        component="h2"
                    >
                        {title}
                    </Typography>
                </Grid>
            )}
            <Grid alignItems={'center'}>
                <IconButton onClick={handleClose}>
                    <Icon
                        icon="mingcute:close-fill"
                        style={{ color: 'var(--primary-main)' }}
                    />
                </IconButton>
            </Grid>
        </Grid>
    );
};

export default ModalHeader;
