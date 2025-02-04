const API_URL = 'https://web-production-5b55f.up.railway.app/api';

export const fetchThumbnails = async (page = 1, filters = {}) => {    
    let url = `${API_URL}/gallery/thumbnails/?page=${page}`;

    if (filters.order) url += `&order=${filters.order}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.categories?.length > 0) url += `&category=${filters.categories.join(',')}`;
    if (filters.startDate) url += `&start_date=${encodeURIComponent(filters.startDate)}`;
    if (filters.endDate) url += `&end_date=${encodeURIComponent(filters.endDate)}`;
    if (filters.minViews) url += `&min_views=${filters.minViews}`;
    if (filters.maxViews) url += `&max_views=${filters.maxViews}`;
    if (filters.minLikes) url += `&min_likes=${filters.minLikes}`;
    if (filters.maxLikes) url += `&max_likes=${filters.maxLikes}`;
    if (filters.minComments) url += `&min_comments=${filters.minComments}`;
    if (filters.maxComments) url += `&max_comments=${filters.maxComments}`;
    if (filters.minMultiplier) url += `&min_multiplier=${filters.minMultiplier}`;
    if (filters.maxMultiplier) url += `&max_multiplier=${filters.maxMultiplier}`;

    try {
        const response = await fetchWithAuth(url, { method: 'GET' });

        if (!response) {
            throw new Error('Network error');
        }

        return response;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};
