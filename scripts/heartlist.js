// Fonction pour charger les miniatures likées depuis l'API
const loadLikedThumbnails = async () => {
    const container = document.getElementById('heartlist-container');
    const emptyState = document.getElementById('empty-state');

    try {
        // Appel à l'API pour récupérer les favoris avec le token Bearer
        const response = await fetch("https://web-production-5b55f.up.railway.app/api/users/favorites/", {
            method: "GET",
            credentials: 'include', 
        });

        if (response.ok) {
            const likedThumbnails = await response.json();

            if (likedThumbnails.length === 0) {
                // Si aucun favori
                container.classList.add('tw-hidden');
                emptyState.classList.remove('tw-hidden');
                return;
            }

            // Sinon, afficher les miniatures
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

// Fonction pour supprimer une miniature
async function deleteThumbnail(thumbnailId) {    
    try {
        setCookie('userSession', '12345', 7);
        const csrftoken = getCookie('csrftoken'); 
        const response = await fetch("https://web-production-5b55f.up.railway.app/api/users/favorites/", {
            method: "DELETE",
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken, 
            },
            body: JSON.stringify({
                thumbnail_id: thumbnailId
            })
        });

        if (response.ok) {
            // Recharger la liste des favoris après la suppression
            await loadLikedThumbnails();
            console.log("Successfully removed from favorites");
        } else {
            console.error("Failed to remove from favorites");
        }
    } catch (error) {
        console.error("Error removing thumbnail:", error);
    }
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';'); 
    console.log(ca)
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length); 
        }
    }
    return null; 
}

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); 
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`; 
}

// Charger les miniatures au chargement de la page
document.addEventListener('DOMContentLoaded', loadLikedThumbnails);

// Rendre la fonction deleteThumbnail accessible globalement
window.deleteThumbnail = deleteThumbnail;
