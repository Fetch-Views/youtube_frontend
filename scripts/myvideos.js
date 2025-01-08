const loadMyVideos = async () => {
    const container = document.getElementById('myvideos-container');
    const emptyState = document.getElementById('empty-state');
    const token = localStorage.getItem('accessToken');

    // Vérifier si le token existe
    if (!token) {
        console.error("No access token found");
        container.classList.add('tw-hidden');
        emptyState.classList.remove('tw-hidden');
        return;
    }

    try {
        // Appel à l'API pour récupérer les favoris avec le token Bearer
        const response = await fetch("http://127.0.0.1:8000/api/users/my_videos/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const myThumbnails = await response.json();

            if (myThumbnails.length === 0) {
                // Si aucun favori
                container.classList.add('tw-hidden');
                emptyState.classList.remove('tw-hidden');
                return;
            }

            // Sinon, afficher les miniatures
            container.classList.remove('tw-hidden');
            emptyState.classList.add('tw-hidden');

            const thumbnailsHTML = myThumbnails.map(thumbnail => `
                <div class="tw-bg-white dark:tw-bg-[#17181b] tw-rounded-xl tw-overflow-hidden 
                            tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
                    <div class="tw-relative tw-group">
                        <img src="${thumbnail.image}" 
                             alt="${thumbnail.title}"
                             class="tw-w-full tw-h-48 tw-object-cover tw-transition-transform 
                                    group-hover:tw-scale-105" />
                    </div>
                    
                    <div class="tw-p-4">
                        <h3 class="tw-font-medium tw-mb-2 tw-line-clamp-2">${thumbnail.title}</h3>
                        <div class="tw-flex tw-items-center tw-gap-2 tw-mb-3">
                            <p class="tw-text-sm tw-text-gray-600 dark:tw-text-gray-400">${thumbnail.category}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = thumbnailsHTML;
        } else {
            console.error("Failed to fetch favorites:", await response.text());
            container.classList.add('tw-hidden');
            emptyState.classList.remove('tw-hidden');
        }
    } catch (error) {
        console.error("Error fetching liked thumbnails:", error);
        container.classList.add('tw-hidden');
        emptyState.classList.remove('tw-hidden');
    }
};

document.addEventListener('DOMContentLoaded', loadMyVideos);
