import React, { createContext, useState, ReactNode, useMemo } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

/**
 * Interface defining the shape of the loader context
 */
export interface LoaderContextType {
    /** Indicates if the UI is in a loading state */
    isLoading: boolean;
    /** Starts the loading state - shows loading overlay */
    startLoading: () => void;
    /** Stops the loading state - hides loading overlay */
    stopLoading: () => void;
}

export const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

interface LoaderProviderProps {
    children: ReactNode;
}

/**
 * LoaderProvider component that manages loading and updating states
 * 
 * This provider offers two distinct states:
 * 1. Loading (isLoading): Used for showing a loading overlay during data fetching or heavy operations
 *    that should block the UI interaction. This is typically used for API calls or initial data loading.
 * 
 * @example
 * ```tsx
 * // For loading state (blocks UI)
 * const { startLoading, stopLoading } = useLoader();
 * startLoading(); // you start the loading state
 * await fetchData(); // you fetch data and complete this operation before calling stopLoading
 * stopLoading(); // you stop the loading state after the operation is completed
 * ```
 */
export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    const value = useMemo(
        () => ({
            isLoading,
            startLoading,
            stopLoading,
        }),
        [isLoading]
    );

    return (
        <LoaderContext.Provider value={value}>
            {children}
            {(isLoading) && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9999,
                    }}
                >
                    <CircularProgress size={60} thickness={4} color="primary" />
                    <Typography variant="h6" color="white">Carregando...</Typography>
                </Box>
            )}
        </LoaderContext.Provider>
    );
};

