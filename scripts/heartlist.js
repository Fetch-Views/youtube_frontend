const loadLikedThumbnails = async () => {
    const container = document.getElementById('heartlist-container');
    const emptyState = document.getElementById('empty-state');

    try {
        const likedThumbnails = await fetchWithAuth("http://127.0.0.1:8000/api/users/favorites/");

        if (likedThumbnails) {
            if (likedThumbnails.length === 0) {
                container.classList.add('tw-hidden');
                emptyState.classList.remove('tw-hidden');
                return;
            }

            container.classList.remove('tw-hidden');
            emptyState.classList.add('tw-hidden');

            const thumbnailsHTML = likedThumbnails.map(thumbnail => `
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
                            <span class="tw-text-gray-400">•</span>
                            <p class="tw-text-sm tw-text-gray-600 dark:tw-text-gray-400">${thumbnail.channel.name}</p>
                        </div>
                        <button onclick="deleteThumbnail('${thumbnail.id}')"
                                class="tw-w-full tw-bg-red-500 tw-text-white tw-py-2 tw-rounded-lg 
                                       hover:tw-bg-red-600 tw-transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');

            container.innerHTML = thumbnailsHTML;
        } else {
            console.error("Failed to fetch favorites");
            container.classList.add('tw-hidden');
            emptyState.classList.remove('tw-hidden');
        }
    } catch (error) {
        console.error("Error fetching liked thumbnails:", error);
        container.classList.add('tw-hidden');
        emptyState.classList.remove('tw-hidden');
    }
};

async function deleteThumbnail(thumbnailId) {    
    try {
        const response = await fetchWithAuth("http://127.0.0.1:8000/api/users/favorites/", {
            method: "DELETE",
            body: JSON.stringify({
                thumbnail_id: thumbnailId
            })
        });

        if (response) {  
            await loadLikedThumbnails();
            console.log("Successfully removed from favorites");
        } else {
            console.error("Failed to remove from favorites");
        }
    } catch (error) {
        console.error("Error removing thumbnail:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadLikedThumbnails);

window.deleteThumbnail = deleteThumbnail;
