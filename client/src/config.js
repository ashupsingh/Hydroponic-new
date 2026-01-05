const getApiUrl = () => {
    // In production (Vercel), we use relative paths via proxy/rewrites
    if (import.meta.env.PROD) {
        return '';
    }
    // In local development, we point to the backend server
    return 'http://localhost:5000';
};

export const API_URL = getApiUrl();
