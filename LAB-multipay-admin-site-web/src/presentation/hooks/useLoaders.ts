import { LoaderContext, LoaderContextType } from '@/presentation/providers/LoaderProvider';
import { useContext } from 'react';

/**
 * LoaderProvider component that manages loading and updating states
 * 
 * Custom hook to access the loader context
 * @throws {Error} If used outside of LoaderProvider
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
const useLoaders = (): LoaderContextType => { // BE SURE to use the hook inside the LoaderProvider!!!
    const context = useContext(LoaderContext);
    if (context === undefined) {
        throw new Error('useLoaders must be used within a LoaderProvider');
    }
    return context;
};

export default useLoaders;