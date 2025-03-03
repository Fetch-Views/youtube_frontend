export const generateThumbnailWithImage = async () => {
    const loadingText = document.getElementById('loadingText'); 
    const imageElement = document.getElementById('thumbnailToEdit'); 
    const prompt = document.querySelector('textarea').value.trim(); 
    const imageToEdit = localStorage.getItem('imageToEdit'); 
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
        const response = await fetchWithAuth('http://127.0.0.1:8000/api/gallery/thumbnails_generation/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                image_base64: imageToEdit,
            }),
        });
        
        if (!response) {  
            throw new Error('Failed to fetch image');
        }
        
        const data = response; 
        
        const base64Image = data.image_base64;

        localStorage.setItem('generatedThumbnail', `data:image/png;base64,${base64Image}`);
        imageElement.src = `data:image/png;base64,${base64Image}`;

        if (loadingText) loadingText.style.display = 'none';
    } catch (error) {
        console.error('Error fetching image:', error);
        if (loadingText) loadingText.innerText = 'Failed to generate image';
    }
};