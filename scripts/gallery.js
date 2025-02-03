import { fetchThumbnails } from './api.js';

let sortState = 0; // 0: random, 1: ascending, 2: descending
let currentPage = 1;
let totalPages = 1;
let isLoading = false; // Pour éviter les chargements multiples
let currentFilters = {
    categories: [],
    minLikes: null,
    maxLikes: null,
    minComments: null,
    maxComments: null,
    minViews: null,
    maxViews: null,
    startDate: null,
    endDate: null,
    search: null,
    order: null  // Nouveau paramètre pour le tri
};
let hasMoreData = true; // Nouvelle variable pour suivre s'il reste des données

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

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

const getMultiplierButton = (views, averageViews) => {
    const multiplier = views / averageViews;
    const multiplierText = multiplier.toFixed(1);
    
    if (averageViews === 0 || multiplier <= 1.5) {
        return `<button class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full 
                    tw-bg-gradient-to-r tw-from-sky-400 tw-to-blue-400
                    tw-text-white">
                x${multiplierText}
            </button>`;
    } else if (multiplier <= 2.0) {
        return `<button class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full 
                    tw-bg-gradient-to-r tw-from-purple-400 tw-to-purple-600
                    tw-text-white">
                x${multiplierText}
            </button>`;
    } else if (multiplier <= 4.0) {
        return `<button class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full 
                    tw-bg-gradient-to-r tw-from-green-400 tw-to-emerald-400
                    tw-text-white">
                x${multiplierText}
            </button>`;
    } else if (multiplier <= 10.0) {
        return `<button class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full 
                    tw-bg-gradient-to-r tw-from-orange-500 tw-to-yellow-500
                    tw-text-white">
                x${multiplierText}
            </button>`;
    } else {
        return `<button class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full 
                    tw-bg-gradient-to-r tw-from-red-500 tw-via-orange-500 tw-to-yellow-500
                    tw-text-white tw-animate-pulse tw-shadow-lg tw-shadow-red-500/50">
                x${multiplierText} 🔥
            </button>`;
    }
};

const renderThumbnails = (thumbnails, append = false) => {
    const container = document.getElementById('thumbnails-container');
    
    const thumbnailsHTML = thumbnails.results.map(thumbnail => `
        <div class="tw-bg-white dark:tw-bg-[#17181b] tw-rounded-xl tw-overflow-hidden 
                    tw-shadow-lg hover:tw-shadow-xl tw-transition-shadow">
            <div class="tw-relative tw-group">
                <img src="${thumbnail.image}" 
                     alt="${thumbnail.title}"
                     class="tw-w-full tw-h-48 tw-object-cover tw-transition-transform 
                            group-hover:tw-scale-105" />
                
                <!-- Bouton cœur modifié -->
                <button onclick="toggleLike(this); event.stopPropagation();"
                        data-thumbnail-id="${thumbnail.id}"
                        class="tw-absolute tw-top-2 tw-right-2 tw-flex tw-items-center tw-justify-center 
                               tw-w-8 tw-h-8 tw-rounded-full tw-bg-black/50 
                               tw-transition-all hover:tw-scale-110 active:tw-scale-95
                               group-hover:tw-opacity-100
                               [&:not(.liked)]:tw-opacity-0
                               [&.liked]:tw-opacity-100">
                    <i class="bi bi-heart-fill tw-transition-colors"></i>
                </button>
                
                <!-- Overlay avec les statistiques -->
                <div class="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-p-3
                            tw-bg-gradient-to-t tw-from-black/70 tw-to-transparent">
                    <div class="tw-flex tw-gap-3 tw-text-white tw-text-sm">
                        <span class="tw-flex tw-items-center tw-gap-1">
                            <i class="bi bi-eye"></i>
                            ${formatNumber(thumbnail.views)}
                        </span>
                        <span class="tw-flex tw-items-center tw-gap-1">
                            <i class="bi bi-chat-dots"></i>
                            ${formatNumber(thumbnail.comments)}
                        </span>
                        <span class="tw-flex tw-items-center tw-gap-1">
                            <i class="bi bi-heart"></i>
                            ${formatNumber(thumbnail.likes)}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="tw-p-4">
                <h3 class="tw-font-medium tw-mb-2 tw-line-clamp-2">${thumbnail.title}</h3>
                <div class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-600 dark:tw-text-gray-400">
                    <span>${thumbnail.channel.name}</span>
                    <span class="tw-text-xs tw-bg-gray-200 dark:tw-bg-gray-800 tw-px-2 tw-py-1 tw-rounded-full">
                        ${thumbnail.category}
                    </span>
                    <div class="tw-flex tw-items-center tw-gap-2">
                        ${getMultiplierButton(thumbnail.views, thumbnail.channel.average_views)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (append) {
        container.insertAdjacentHTML('beforeend', thumbnailsHTML);
    } else {
        container.innerHTML = thumbnailsHTML;
    }
};

const renderPagination = (total_pages) => {
    const container = document.getElementById('thumbnails-container');
    
    const paginationHTML = `
        <div class="tw-col-span-full tw-flex tw-justify-center tw-items-center tw-gap-2 tw-mt-8">
            <button 
                onclick="changePage(${currentPage - 1})"
                class="tw-px-3 tw-py-2 tw-rounded-lg tw-text-sm tw-border tw-border-gray-300 
                       dark:tw-border-gray-600 hover:tw-border-[#6366f1] tw-transition-colors
                       ${currentPage === 1 ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}"
                ${currentPage === 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
            
            <span class="tw-text-sm">
                Page ${currentPage} of ${total_pages}
            </span>
            
            <button 
                onclick="changePage(${currentPage + 1})"
                class="tw-px-3 tw-py-2 tw-rounded-lg tw-text-sm tw-border tw-border-gray-300 
                       dark:tw-border-gray-600 hover:tw-border-[#6366f1] tw-transition-colors
                       ${currentPage === total_pages ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}"
                ${currentPage === total_pages ? 'disabled' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', paginationHTML);
};

const initGallery = async () => {
    try {
        hasMoreData = true; // Réinitialiser l'état
        const thumbnails = await fetchThumbnails(currentPage, currentFilters);
        
        if (!thumbnails.results || thumbnails.results.length === 0) {
            hasMoreData = false;
            console.log('No thumbnails available');
            document.getElementById('thumbnails-container').innerHTML = `
                <div class="tw-col-span-full tw-text-center tw-py-8 tw-text-gray-500">
                    No thumbnails available.
                </div>
            `;
            return;
        }
        
        totalPages = thumbnails.total_pages;
        renderThumbnails(thumbnails);
        
        // Vérifier s'il y a une page suivante
        hasMoreData = !!thumbnails.next;
        
        setTimeout(() => {
            initInfiniteScroll();
        }, 100);
    } catch (error) {
        console.error('Erreur lors du chargement des vignettes:', error);
        document.getElementById('thumbnails-container').innerHTML = `
            <div class="tw-col-span-full tw-text-center tw-py-8 tw-text-gray-500">
                Une erreur est survenue lors du chargement des vignettes.
                <button onclick="initGallery()" class="tw-text-[#6366f1] hover:tw-underline">
                    Réessayer
                </button>
            </div>
        `;
    }
};

const initInfiniteScroll = () => {
    // Supprimer l'ancien sentinel s'il existe
    const oldSentinel = document.getElementById('sentinel');
    if (oldSentinel) {
        oldSentinel.remove();
    }

    const options = {
        root: null,
        rootMargin: '500px', // Augmenté significativement
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && currentPage < totalPages) {
                console.log('Loading more thumbnails...'); // Debug
                loadMoreThumbnails();
            }
        });
    }, options);

    // Créer et observer l'élément sentinel
    const sentinel = document.createElement('div');
    sentinel.id = 'sentinel';
    sentinel.style.height = '20px'; // Augmenté pour une meilleure détection
    document.getElementById('thumbnails-container').appendChild(sentinel);
    observer.observe(sentinel);
};

const renderLoadingSpinner = () => {
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.className = 'tw-col-span-full tw-flex tw-justify-center tw-items-center tw-py-8';
    spinner.innerHTML = `
        <div class="tw-flex tw-items-center tw-gap-2 tw-text-gray-500 dark:tw-text-gray-400">
            <div class="tw-w-5 tw-h-5 tw-border-2 tw-border-current tw-border-t-transparent 
                        tw-rounded-full tw-animate-spin"></div>
            <span>Loading more thumbnails...</span>
        </div>
    `;
    document.getElementById('thumbnails-container').appendChild(spinner);
};

const removeLoadingSpinner = () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
};

const applyFilter = async (category) => {
    // Réinitialiser la pagination
    currentPage = 1;
    
    // Mettre à jour les filtres
    if (category) {
        currentFilters.category = category;
    } else {
        delete currentFilters.category;
    }
    
    try {
        const thumbnails = await fetchThumbnails(currentPage, currentFilters);
        totalPages = thumbnails.total_pages;
        renderThumbnails(thumbnails);
        
        // Réinitialiser l'infinite scroll
        setTimeout(() => {
            initInfiniteScroll();
        }, 100);
    } catch (error) {
        console.error('Erreur lors de l\'application des filtres:', error);
    }
};

const loadMoreThumbnails = debounce(async () => {
    if (isLoading || !hasMoreData) {
        console.log('Loading blocked:', { isLoading, hasMoreData });
        return;
    }
    
    isLoading = true;
    renderLoadingSpinner();
    currentPage++;
    
    try {
        const thumbnails = await fetchThumbnails(currentPage, currentFilters);
        removeLoadingSpinner();
        
        if (!thumbnails.results || thumbnails.results.length === 0) {
            hasMoreData = false;
            console.log('No more thumbnails available');
            return;
        }
        
        renderThumbnails(thumbnails, true);
        
        // Vérifier si l'API indique qu'il y a une page suivante
        hasMoreData = !!thumbnails.next;
        if (!hasMoreData) {
            console.log('No next page available, disabling infinite scroll');
        }
        
        setTimeout(() => {
            initInfiniteScroll();
        }, 100);
    } catch (error) {
        console.error('Erreur lors du chargement des vignettes supplémentaires:', error);
        currentPage--; // Revenir à la page précédente en cas d'erreur
        hasMoreData = false; // Désactiver le chargement en cas d'erreur
        removeLoadingSpinner();
    } finally {
        isLoading = false;
    }
}, 500);

// Mise à jour de l'écouteur de défilement
window.addEventListener('scroll', () => {
    if (!hasMoreData) return; // Arrêter immédiatement si plus de données

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.offsetHeight;
    
    if (documentHeight - scrollPosition < 500) {
        console.log('Loading more thumbnails from scroll event...'); // Debug
        loadMoreThumbnails();
    }
});

// Lancer l'initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initGallery);

// Rendre la fonction globale en l'ajoutant à window
window.toggleSortOrder = function() {
    const icon = document.getElementById('sortIcon');
    sortState = (sortState + 1) % 3;
    
    switch(sortState) {
        case 0: // Random
            icon.className = 'bi bi-shuffle';
            currentFilters.order = null;  // Pas de tri spécifique
            break;
        case 1: // Ascending
            icon.className = 'bi bi-sort-up';
            currentFilters.order = 'asc';
            break;
        case 2: // Descending
            icon.className = 'bi bi-sort-down';
            currentFilters.order = 'desc';
            break;
    }
    
    // Réinitialiser la pagination et recharger
    currentPage = 1;
    hasMoreData = true;
    initGallery();
}

            // Gestionnaire pour les dropdowns (si nécessaire)
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = ['profileDropdown'];
                
    window.addEventListener('click', function(e) {
        dropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
                if (dropdown) {
                    const button = dropdown.previousElementSibling;
                    if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.add('tw-hidden');
                    }
                }
        });
    });
});

            // Fonctions pour gérer l'état des boutons
window.toggleTrendingActive = function() {
    const button = document.getElementById('trendingButton');
    const isActive = button.getAttribute('data-active') === 'true';
    button.setAttribute('data-active', !isActive);
}

window.toggleSeasonalActive = function() {
    const button = document.getElementById('seasonalButton');
    const isActive = button.getAttribute('data-active') === 'true';
    button.setAttribute('data-active', !isActive);
}

window.toggleDatePicker = function() {
    const datePicker = document.getElementById('datePicker');
    datePicker.classList.toggle('tw-hidden');
                
    if (!datePicker.classList.contains('tw-hidden')) {
        generateCalendar();
    }
}

let startDate = null;
let endDate = null;
            
// Initialisation de la date courante
let currentDate = new Date();

window.generateCalendar = function() {
    const datePicker = document.getElementById('datePicker');
    const calendar = datePicker.querySelector('.tw-grid');
                
    const monthName = currentDate.toLocaleDateString('en-US', { 
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('currentMonth').textContent = monthName;
                
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                
    while (calendar.children.length > 7) {
        calendar.removeChild(calendar.lastChild);
    }
                
    let firstDayIndex = firstDay.getDay() - 1;
    if (firstDayIndex === -1) firstDayIndex = 6;
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDay = document.createElement('div');
        calendar.appendChild(emptyDay);
    }
                
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('button');
        const currentDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    
        dayElement.className = `tw-w-8 tw-h-8 tw-rounded-full tw-text-sm tw-transition-colors
                                hover:tw-bg-[#6366f1]/10 focus:tw-outline-none
                                ${isDateSelected(currentDateObj) ? 'tw-bg-[#6366f1] tw-text-white' : ''}`;
        dayElement.textContent = day;
                    
        dayElement.onclick = () => selectDate(currentDateObj);
        calendar.appendChild(dayElement);
    }
}

// Fonction unifiée pour changer de mois
window.changeMonth = function(increment) {
    currentDate.setMonth(currentDate.getMonth() + increment);
    generateCalendar();
}

// On peut supprimer ou garder les fonctions previousMonth et nextMonth pour rétrocompatibilité
window.previousMonth = function() {
    changeMonth(-1);
}

window.nextMonth = function() {
    changeMonth(1);
}

// Rendre les autres fonctions du calendrier globales
window.selectDate = function(date) {
    if (!startDate || (startDate && endDate)) {
        startDate = date;
        endDate = null;
    } else if (date > startDate) {
        endDate = date;
        setTimeout(() => {
            document.getElementById('datePicker').classList.add('tw-hidden');
        }, 200); 
    } else {
        endDate = startDate;
        startDate = date;
        setTimeout(() => {
            document.getElementById('datePicker').classList.add('tw-hidden');
        }, 200); 
    }
    
    // Formater les dates pour l'API (YYYY-MM-DD)
    const formatDateForAPI = (date) => {
        return date.toISOString().split('T')[0];
    };
    
    // Mettre à jour les filtres avec les dates formatées
    currentFilters.startDate = startDate ? formatDateForAPI(startDate) : null;
    currentFilters.endDate = endDate ? formatDateForAPI(endDate) : null;
    
    // Mettre à jour l'affichage du texte des dates
    updateDateRangeText();
    generateCalendar();
    
    // Si on a les deux dates, déclencher la mise à jour
    if (startDate && endDate) {
        debouncedUpdateFilters();
    }
}

window.isDateSelected = function(date) {
    if (!startDate) return false;
    if (!endDate) return date.getTime() === startDate.getTime();
    return date >= startDate && date <= endDate;
}

window.updateDateRangeText = function() {
    const dateRangeText = document.getElementById('dateRangeText');
    if (!startDate) {
        dateRangeText.textContent = 'Select dates...';
    } else if (!endDate) {
        dateRangeText.textContent = formatDate(startDate);
    } else {
        dateRangeText.textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
}

window.formatDate = function(date) {
    return date.toLocaleDateString('fr-FR', { 
        day: 'numeric',
        month: 'short'
    });
}

document.addEventListener('click', (e) => {
    const datePicker = document.getElementById('datePicker');
    const dateButton = document.querySelector('button[onclick="toggleDatePicker()"]');
                
    if (!datePicker.contains(e.target) && !dateButton.contains(e.target) && 
        !datePicker.classList.contains('tw-hidden') && 
        (!startDate || (startDate && endDate))) {
            datePicker.classList.add('tw-hidden');
        }
});

window.updateViewsRange = function() {
    const minInput = document.getElementById('minViews');
    const maxInput = document.getElementById('maxViews');
    const errorMessage = document.getElementById('viewsError');
    
    let minValue = minInput.value ? parseInt(minInput.value) : null;
    let maxValue = maxInput.value ? parseInt(maxInput.value) : null;
    
    // Validation
    if (maxValue !== null && minValue !== null && maxValue < minValue) {
        errorMessage.classList.remove('tw-hidden');
        maxInput.classList.add('tw-border-red-500');
        return;
    } else {
        errorMessage.classList.add('tw-hidden');
        maxInput.classList.remove('tw-border-red-500');
    }
    
    // Mise à jour des filtres
    currentFilters.minViews = minValue;
    currentFilters.maxViews = maxValue;
    
    // Utiliser la version debounced pour la mise à jour
    debouncedUpdateFilters();
};

window.updateLikesRange = function() {
    const minInput = document.getElementById('minLikes');
    const maxInput = document.getElementById('maxLikes');
    const errorMessage = document.getElementById('likesError');
    
    let minValue = minInput.value ? parseInt(minInput.value) : null;
    let maxValue = maxInput.value ? parseInt(maxInput.value) : null;
    
    // Validation
    if (maxValue !== null && minValue !== null && maxValue < minValue) {
        errorMessage.classList.remove('tw-hidden');
        maxInput.classList.add('tw-border-red-500');
        return;
    } else {
        errorMessage.classList.add('tw-hidden');
        maxInput.classList.remove('tw-border-red-500');
    }
    
    // Mise à jour des filtres
    currentFilters.minLikes = minValue;
    currentFilters.maxLikes = maxValue;
    
    // Utiliser la version debounced pour la mise à jour
    debouncedUpdateFilters();
};

window.updateCommentsRange = function() {
    const minInput = document.getElementById('minComments');
    const maxInput = document.getElementById('maxComments');
    const errorMessage = document.getElementById('commentsError');
    
    let minValue = minInput.value ? parseInt(minInput.value) : null;
    let maxValue = maxInput.value ? parseInt(maxInput.value) : null;
    
    // Validation
    if (maxValue !== null && minValue !== null && maxValue < minValue) {
        errorMessage.classList.remove('tw-hidden');
        maxInput.classList.add('tw-border-red-500');
        return;
    } else {
        errorMessage.classList.add('tw-hidden');
        maxInput.classList.remove('tw-border-red-500');
    }
    
    // Mise à jour des filtres
    currentFilters.minComments = minValue;
    currentFilters.maxComments = maxValue;
    
    // Utiliser la version debounced pour la mise à jour
    debouncedUpdateFilters();
};

function validateRange(type) {
    const minInput = document.getElementById(`min${type}`);
    const maxInput = document.getElementById(`max${type}`);
    const errorMessage = document.getElementById(`${type.toLowerCase()}Error`);
                
    let minValue = minInput.value ? parseInt(minInput.value) : 0;
    let maxValue = maxInput.value ? parseInt(maxInput.value) : Infinity;
                
    if (maxValue < minValue && maxValue !== 0) {
        errorMessage.classList.remove('tw-hidden');
        maxInput.classList.add('tw-border-red-500');
        maxInput.value = minValue;
        maxValue = minValue;
    } else {
        errorMessage.classList.add('tw-hidden');
        maxInput.classList.remove('tw-border-red-500');
    }

    if (maxInput.value && minValue > maxValue) {
        minInput.value = maxValue;
        minValue = maxValue;
    }
                
}

window.clearAllFilters = function() {
    hasMoreData = true;
    currentFilters = {
        categories: [],
        minLikes: null,
        maxLikes: null,
        minComments: null,
        maxComments: null,
        minViews: null,
        maxViews: null,
        startDate: null,
        endDate: null,
    };
    
    // Réinitialiser les inputs
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('minViews').value = '';
    document.getElementById('maxViews').value = '';
    document.getElementById('minLikes').value = '';
    document.getElementById('maxLikes').value = '';
    document.getElementById('minComments').value = '';
    document.getElementById('maxComments').value = '';
    
    // Cacher les messages d'erreur
    document.getElementById('dateError').classList.add('tw-hidden');
    document.getElementById('viewsError').classList.add('tw-hidden');
    document.getElementById('likesError').classList.add('tw-hidden');
    document.getElementById('commentsError').classList.add('tw-hidden');
    
    currentPage = 1;
    initGallery();
};

window.toggleMultiplier = function(button) {
    const allButtons = document.querySelectorAll('[onclick="toggleMultiplier(this)"]');
                
    if (button.dataset.active === "true") {
        button.dataset.active = "false";
        allButtons.forEach(btn => {
            btn.classList.remove('tw-ring-white');
            btn.classList.add('tw-ring-white/50');
        });
    } else {
        allButtons.forEach(btn => {
            btn.dataset.active = btn === button ? "true" : "false";
            if (btn === button) {
                btn.classList.remove('tw-ring-white/50');
                btn.classList.add('tw-ring-white');
            } else {
                btn.classList.remove('tw-ring-white');
                btn.classList.add('tw-ring-white/50');
            }
        });
    }
}


window.changePage = async function(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
        const thumbnails = await fetchThumbnails(currentPage, currentFilters);
        renderThumbnails(thumbnails);
        renderPagination(totalPages);
    } catch (error) {
        console.error('Erreur lors du changement de page:', error);
    }
};

window.filterByCategory = function(checkbox) {
    // S'assurer que categories existe
    if (!currentFilters.categories) {
        currentFilters.categories = [];
    }

    const category = checkbox.parentElement.querySelector('span').textContent.trim();
    
    if (checkbox.checked) {
        // Ajouter la catégorie si elle n'est pas déjà présente
        if (!currentFilters.categories.includes(category)) {
            currentFilters.categories.push(category);
        }
    } else {
        // Retirer la catégorie
        currentFilters.categories = currentFilters.categories.filter(cat => cat !== category);
    }    
    // Réinitialiser la pagination et recharger
    currentPage = 1;
    initGallery();
};

// Utiliser debounce pour les mises à jour de filtres
const debouncedUpdateFilters = debounce(() => {
    currentPage = 1;
    hasMoreData = true;
    initGallery();
}, 500); // Attendre 500ms après la dernière frappe

window.updateDateRange = function() {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const errorMessage = document.getElementById('dateError');
    
    let startValue = startInput.value ? startInput.value : null;
    let endValue = endInput.value ? endInput.value : null;
    
    console.log('Date values:', { startValue, endValue }); // Debug
    
    // Validation
    if (startValue && endValue && new Date(endValue) < new Date(startValue)) {
        errorMessage.classList.remove('tw-hidden');
        endInput.classList.add('tw-border-red-500');
        return;
    } else {
        errorMessage.classList.add('tw-hidden');
        endInput.classList.remove('tw-border-red-500');
    }
    
    // Mise à jour des filtres
    currentFilters.startDate = startValue;
    currentFilters.endDate = endValue;
    
    console.log('Updated filters:', currentFilters); // Debug
    
    // Utiliser la version debounced pour la mise à jour
    debouncedUpdateFilters();
};

// Fonction pour gérer la sélection des dates
window.handleDateSelection = function(date, isStart) {
    if (isStart) {
        document.getElementById('startDate').value = date;
    } else {
        document.getElementById('endDate').value = date;
    }
    
    // Déclencher la mise à jour des filtres
    updateDateRange();
};

// Assurez-vous que cette fonction est appelée quand une date est sélectionnée dans le calendrier
window.onDateSelect = function(date) {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    
    if (!startInput.value || (startInput.value && endInput.value)) {
        // Si pas de date de début ou si les deux dates sont déjà définies,
        // on commence une nouvelle sélection
        startInput.value = date;
        endInput.value = '';
    } else {
        // Sinon, on définit la date de fin
        endInput.value = date;
    }
    
    updateDateRange();
};

// Nouvelle fonction pour gérer la recherche
window.handleSearch = function(event) {    
    // Vérifier si c'est la touche Entrée
    if (event.key === 'Enter') {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput.value.trim();
        
        currentFilters.search = searchTerm || null;
        
        currentPage = 1;
        hasMoreData = true;
        initGallery();
    }
};

// S'assurer que l'événement est bien lié au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Chercher l'input de recherche par sa classe ou son attribut name si l'ID ne fonctionne pas
    const searchInput = document.querySelector('input[type="search"]') || 
                       document.querySelector('input[placeholder*="Search"]') ||
                       document.getElementById('searchInput');
                       
    if (searchInput) {
        console.log('Search input found:', searchInput); // Debug
        searchInput.id = 'searchInput'; // S'assurer que l'ID est défini
        searchInput.addEventListener('keyup', handleSearch);
        console.log('Search event listener added'); // Debug
    } else {
        console.error('Search input not found'); // Debug
    }
});

window.toggleLike = async function(button) {
    const thumbnailId = button.getAttribute('data-thumbnail-id');
    const isLiked = button.classList.contains('liked');
    const method = isLiked ? "DELETE" : "POST"; 

    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (method === "POST") {
        options.body = JSON.stringify({ thumbnail_id: thumbnailId });
    }

    try {
        const response = await fetchWithAuth("https://web-production-5b55f.up.railway.app/api/users/favorites/", options);

        if (response) {  
            button.classList.toggle('liked'); 
            const heart = button.querySelector('i');
            heart.classList.toggle('tw-text-red-500'); 
            console.log(`Successfully ${isLiked ? 'removed from' : 'added to'} favorites`);
        } else {
            console.error(`Failed to ${isLiked ? 'remove from' : 'add to'} favorites`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
