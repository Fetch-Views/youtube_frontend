const API_URL = 'http://127.0.0.1:8000/api';

export const fetchThumbnails = async (page = 1, filters = {}) => {
    const accessToken = localStorage.getItem('accessToken');
    console.log('Filtres actuels:', filters); // Debug log
    
    // Construction de l'URL avec tous les paramètres de filtrage
    let url = `${API_URL}/gallery/thumbnails/?page=${page}`;
    
    // Ajout du paramètre de tri
    if (filters.order) {
        url += `&order=${filters.order}`;
    }
    
    // Ajout du terme de recherche
    if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
    }
    
    // Ajout des catégories
    if (filters.categories && filters.categories.length > 0) {
        url += `&category=${filters.categories.join(',')}`;
    }
    
    // Ajout des filtres de dates
    if (filters.startDate !== undefined && filters.startDate !== null) {
        url += `&start_date=${encodeURIComponent(filters.startDate)}`;
    }
    if (filters.endDate !== undefined && filters.endDate !== null) {
        url += `&end_date=${encodeURIComponent(filters.endDate)}`;
    }
    
    // Ajout des filtres de vues
    if (filters.minViews !== undefined && filters.minViews !== null) {
        url += `&min_views=${filters.minViews}`;
    }
    if (filters.maxViews !== undefined && filters.maxViews !== null) {
        url += `&max_views=${filters.maxViews}`;
    }
    
    // Ajout des filtres de likes
    if (filters.minLikes !== undefined && filters.minLikes !== null) {
        url += `&min_likes=${filters.minLikes}`;
    }
    if (filters.maxLikes !== undefined && filters.maxLikes !== null) {
        url += `&max_likes=${filters.maxLikes}`;
    }
    
    // Ajout des filtres de commentaires
    if (filters.minComments !== undefined && filters.minComments !== null) {
        url += `&min_comments=${filters.minComments}`;
    }
    if (filters.maxComments !== undefined && filters.maxComments !== null) {
        url += `&max_comments=${filters.maxComments}`;
    }
    
    console.log('URL de requête:', url); // Debug log
    
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
        console.log('Réponse API:', data); // Debug log
        return data;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};