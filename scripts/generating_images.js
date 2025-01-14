function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function generateThumbnail() {
    const loadingText = document.getElementById('loadingText');
    const imageElement = document.getElementById('generatedThumbnail');
    const prompt = localStorage.getItem('prompt');
    const csrftoken = getCookie('csrftoken');

    loadingText.style.display = 'block';

    const storedImage = localStorage.getItem('generatedThumbnail');
    if (storedImage) {
        imageElement.src = storedImage;
        loadingText.style.display = 'none';
        return; 
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/gallery/thumbnails_generation/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        const data = await response.json();
        const base64Image = data.image_base64;

        // Enregistrer l'image générée dans localStorage
        localStorage.setItem('generatedThumbnail', `data:image/png;base64,${base64Image}`);

        // Afficher l'image générée
        imageElement.src = `data:image/png;base64,${base64Image}`;

        loadingText.style.display = 'none';

    } catch (error) {
        console.error('Error fetching image:', error);
        loadingText.innerText = 'Failed to load image';
    }
}

window.onload = function() {
    // Vérifier si une image est stockée dans localStorage
    const storedImage = localStorage.getItem('generatedThumbnail');
    const imageElement = document.getElementById('generatedThumbnail');
    const loadingText = document.getElementById('loadingText');

    if (storedImage) {
        // Si l'image est stockée, l'afficher directement
        imageElement.src = storedImage;
        loadingText.style.display = 'none'; // Masquer le texte "Loading..."
    } else {
        // Si aucune image n'est stockée, appeler la fonction pour générer l'image
        generateThumbnail();
    }
};
