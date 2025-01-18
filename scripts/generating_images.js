function gonext() {
    localStorage.setItem('previous_page', 'thumbnails_generator.html');
    window.location.href = 'planify_video.html';
}

function selectThumbnail(element) {
    document.querySelectorAll('.tw-cursor-pointer > div').forEach(el => {
        el.classList.remove('tw-border-[#6366f1]');
        el.classList.add('tw-border-transparent');
    });
    
    element.querySelector('div').classList.remove('tw-border-transparent');
    element.querySelector('div').classList.add('tw-border-[#6366f1]');

    const selectedImage = element.querySelector('img').src;
    localStorage.setItem('selectedThumbnail', selectedImage);
}

function editThumbnail(element) {
    localStorage.setItem('previous_page', 'thumbnails_generator.html');
    const imageToEdit = element.parentElement.querySelector('img').src;
    
    localStorage.setItem('imageToEdit', imageToEdit);
    localStorage.setItem('sourcePage', window.location.pathname.split('/').pop());
    
    window.location.href = 'edit_thumbnail.html?source=generator';
}

function savePrompt() {
    const prompt = document.getElementById('prompt').value;

    if (!prompt) {
        alert('Please fill in the prompt field before generating');
        return;
    }

    localStorage.setItem('prompt', prompt);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function handleGenerateThumbnail() {
    const promptElement = document.getElementById('prompt');
    const loadingText = document.getElementById('loadingText');
    const imageElement = document.getElementById('generatedThumbnail');
    const csrftoken = getCookie('csrftoken');

    const prompt = promptElement.value.trim();

    if (!prompt) {
        alert('Please fill in the prompt field before generating.');
        return;
    }

    localStorage.setItem('prompt', prompt);

    loadingText.style.display = 'block';
    loadingText.innerText = 'Generating...';

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
        console.error('Error generating thumbnail:', error);
        loadingText.innerText = 'Failed to load image';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-thumbnail');
    if (generateButton) {
        generateButton.addEventListener('click', handleGenerateThumbnail);
    }

    const nextButton = document.getElementById('next-step');
    if (nextButton) {
        nextButton.addEventListener('click', gonext);
    }

    const previousButton = document.getElementById('previous-step');
    if (previousButton) {
        previousButton.addEventListener('click', () => {
            window.location.href = 'workflow.html';
        });
    }

    const imageElement = document.getElementById('generatedThumbnail');
    const storedImage = localStorage.getItem('generatedThumbnail');
    const defaultImageUrl = 'https://via.placeholder.com/533x300.png?text=Default+Thumbnail';

    imageElement.src = storedImage || defaultImageUrl; 
    document.getElementById('loadingText').style.display = 'none'; 
});
