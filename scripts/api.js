const API_URL = 'http://127.0.0.1:8000/api';

export const fetchThumbnails = async (page = 1, filters = {}) => {
    const accessToken = localStorage.getItem('accessToken');
    
    // Construction de l'URL avec tous les paramètres de filtrage
    let url = `${API_URL}/gallery/thumbnails/?page=${page}`;
    
    // Ajout des catégories (maintenant gérées comme un tableau)
    if (filters.categories && filters.categories.length > 0) {
        url += `&category=${encodeURIComponent(filters.categories.join(','))}`;
    }
    
    // Ajout des autres filtres...
    if (filters.minViews) url += `&min_views=${filters.minViews}`;
    if (filters.maxViews) url += `&max_views=${filters.maxViews}`;
    if (filters.minComments) url += `&min_comments=${filters.minComments}`;
    if (filters.maxComments) url += `&max_comments=${filters.maxComments}`;
    if (filters.minLikes) url += `&min_likes=${filters.minLikes}`;
    if (filters.maxLikes) url += `&max_likes=${filters.maxLikes}`;
    
    console.log('Fetching URL:', url);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error('Network error');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        return data;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};