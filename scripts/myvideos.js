const BACKEND_URL = window.location.hostname === "127.0.0.1" 
        ? "http://127.0.0.1:8000" 
        : "https://web-production-5b55f.up.railway.app";

const loadMyVideos = async () => {
    const container = document.getElementById('myvideos-container');
    const emptyState = document.getElementById('empty-state');

    try {
        const myThumbnails = await fetchWithAuth(`${BACKEND_URL}/api/users/my_videos/`);

        if (myThumbnails) {
            
            if (myThumbnails.length === 0) {
                container.classList.add('tw-hidden');
                emptyState.classList.remove('tw-hidden');
                return;
            }

            
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
            console.error("Failed to fetch videos");
            container.classList.add('tw-hidden');
            emptyState.classList.remove('tw-hidden');
        }
    } catch (error) {
        console.error("Error fetching videos");
        container.classList.add('tw-hidden');
        emptyState.classList.remove('tw-hidden');
    }
};

document.addEventListener('DOMContentLoaded', loadMyVideos);
