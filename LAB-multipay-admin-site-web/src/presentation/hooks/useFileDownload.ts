import { useState, useCallback } from 'react';

export const useFileDownload = () => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadFile = useCallback(async (fileUrl: string, fileName: string) => {
        setIsDownloading(true);
        try {
            const proxyUrl = `/api/download?url=${encodeURIComponent(fileUrl)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`Falha no download via proxy: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.download = fileName || 'arquivo';

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erro no download via Blob (Proxy):", error);
            window.open(fileUrl, '_blank', 'noopener,noreferrer');
        } finally {
            setIsDownloading(false);
        }
    }, []);

    return { downloadFile, isDownloading };
};