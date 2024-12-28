// Fonction pour charger les miniatures likées
const loadLikedThumbnails = () => {
    const container = document.getElementById('heartlist-container');
    const emptyState = document.getElementById('empty-state');
    
    // Récupérer les miniatures likées depuis le localStorage ou une API
    const likedThumbnails = []; // À implémenter : récupération des miniatures likées
    
    if (likedThumbnails.length === 0) {
        container.classList.add('tw-hidden');
        emptyState.classList.remove('tw-hidden');
        return;
    }

    container.classList.remove('tw-hidden');
    emptyState.classList.add('tw-hidden');

    // Afficher les miniatures
    const thumbnailsHTML = likedThumbnails.map(thumbnail => `
        <div class="tw-bg-white dark:tw-bg-[#17181b] tw-rounded-xl tw-overflow-hidden 
                    tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
            <div class="tw-relative tw-group">
                <img src="${thumbnail.image}" 
                     alt="${thumbnail.title}"
                     class="tw-w-full tw-h-48 tw-object-cover tw-transition-transform 
                            group-hover:tw-scale-105" />
                
                <button onclick="toggleLike(this); event.stopPropagation();" 
                        class="tw-absolute tw-top-2 tw-right-2 tw-flex tw-items-center tw-justify-center 
                               tw-w-8 tw-h-8 tw-rounded-full tw-bg-black/50 liked
                               tw-transition-all hover:tw-scale-110 active:tw-scale-95">
                    <i class="bi bi-heart-fill tw-text-red-500"></i>
                </button>
            </div>
            
            <div class="tw-p-4">
                <h3 class="tw-font-medium tw-mb-2 tw-line-clamp-2">${thumbnail.title}</h3>
                <!-- ... autres informations de la miniature ... -->
            </div>
        </div>
    `).join('');

    container.innerHTML = thumbnailsHTML;
};

// Charger les miniatures au chargement de la page
document.addEventListener('DOMContentLoaded', loadLikedThumbnails);
