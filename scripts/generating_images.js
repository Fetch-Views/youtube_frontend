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

        localStorage.setItem('generatedThumbnail', `data:image/png;base64,${base64Image}`);

        imageElement.src = `data:image/png;base64,${base64Image}`;

        loadingText.style.display = 'none';

    } catch (error) {
        console.error('Error fetching image:', error);
        loadingText.innerText = 'Failed to load image';
    }
}

window.onload = function() {
    const imageElement = document.getElementById('generatedThumbnail');
    const storedImage = localStorage.getItem('generatedThumbnail');
    const loadingText = document.getElementById('loadingText');
    const previous_page = localStorage.getItem('previous_page');

    if (previous_page?.trim() == 'workflow.html'){
        generateThumbnail();
    }
    else {
        imageElement.src = storedImage;
        loadingText.style.display = 'none'; 
    }
};
