const BACKEND_URL = window.location.hostname === "127.0.0.1" 
        ? "http://127.0.0.1:8000" 
        : "https://web-production-5b55f.up.railway.app";

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


async function handleGenerateThumbnail() {
    const video_topicElement = document.getElementById('video_topic');
    const default_titleElement = document.getElementById('default-title');
    const titleElement = document.getElementById('title');
    const loadingText = document.getElementById('loadingText');
    const imageElement = document.getElementById('generatedThumbnail');
    const category = document.getElementById('category').value;

    const video_topic = video_topicElement.value.trim();
    const default_title = default_titleElement.checked; 
    const title = titleElement.value.trim(); 

    if (!video_topic) {
        alert('Please fill in the video topic field before generating.');
        return;
    }

    localStorage.setItem('video_topic', video_topic);

    loadingText.style.display = 'block';
    loadingText.innerText = 'Generating...';

    const requestData = {
        video_topic: video_topic,
        default_title: default_title, 
        title: title,
        category: category,
    };

    const options = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    };

    try {
        const response = await fetchWithAuth(`${BACKEND_URL}/api/gallery/thumbnails_generation/`, options);
        
        if (!response) {  
            throw new Error('Failed to fetch image');
        }

        if (response.status === 402) {
            alert("You don't have enough credits to generate a thumbnail.");
            loadingText.style.display = 'none';  
            return;  
        }
        
        const data = response; 
        
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

    const download_thumbnail = document.getElementById('download-thumbnail');
    if (download_thumbnail) {
        download_thumbnail.addEventListener('click', () => {
            const storedImage = localStorage.getItem('generatedThumbnail');
            if (storedImage) {
                const link = document.createElement('a');
                link.href = storedImage;
                link.download = 'generated-thumbnail.png'; 
                document.body.appendChild(link); 
                link.click();
                document.body.removeChild(link); 
            } else {
                alert('No thumbnail found to download!');
            }
        });
    }

    const imageElement = document.getElementById('generatedThumbnail');
    const storedImage = localStorage.getItem('generatedThumbnail');
    const defaultImageUrl = 'https://via.placeholder.com/533x300.png?text=Default+Thumbnail';

    imageElement.src = storedImage || defaultImageUrl; 
    document.getElementById('loadingText').style.display = 'none'; 
});
