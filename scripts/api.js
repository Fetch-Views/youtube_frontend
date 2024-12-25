const API_URL = 'http://127.0.0.1:8000/api';

export const fetchThumbnails = async (filters = {}) => {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch(`${API_URL}/gallery/thumbnails/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });
        
        if (!response.ok) throw new Error('Network error');
        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};