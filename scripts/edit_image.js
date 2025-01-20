export const generateThumbnailWithImage = async () => {
    const loadingText = document.getElementById('loadingText'); 
    const imageElement = document.getElementById('thumbnailToEdit'); 
    const prompt = document.querySelector('textarea').value.trim(); 
    const imageToEdit = localStorage.getItem('imageToEdit'); 
    const csrftoken = getCookie('csrftoken'); 
    console.log('fetchThumbnails called');

    if (loadingText) loadingText.style.display = 'block';

    if (!prompt) {
        console.error('Missing prompt');
        if (loadingText) loadingText.innerText = 'Please provide a prompt';
        return;
    }

    if (!imageToEdit) {
        console.error('Missing image to edit');
        if (loadingText) loadingText.innerText = 'No image selected to edit';
        return;
    }

    try {
        const response = await fetch('https://web-production-5b55f.up.railway.app/api/gallery/thumbnails_generation/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                prompt: prompt,
                image_base64: imageToEdit, 
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        const data = await response.json();
        const base64Image = data.image_base64;

        localStorage.setItem('generatedThumbnail', `data:image/png;base64,${base64Image}`);
        imageElement.src = `data:image/png;base64,${base64Image}`;

        if (loadingText) loadingText.style.display = 'none';
    } catch (error) {
        console.error('Error fetching image:', error);
        if (loadingText) loadingText.innerText = 'Failed to generate image';
    }
};