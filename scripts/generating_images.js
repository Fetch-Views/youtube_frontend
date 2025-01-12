async function generateThumbnailsFromPrompt() {
    const videoDescription = localStorage.getItem('videoDescription');
    if (!videoDescription) {
        console.error("No video description found in localStorage.");
        return;
    }

    try {
        console.log("Prompt:", videoDescription);

        const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer sk-OtdtJSOHR9HF7wpGE68E4EAfBrliu68UZ6qZYl5dXl1TkjfI', 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: videoDescription, 
                output_format: 'jpeg', 
                num_images: 3, 
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("API Error Details:", errorDetails);
            throw new Error(`Error fetching images from Stability AI API: ${response.status}`);
        }

        const result = await response.json();
        const images = result.output.map(image => URL.createObjectURL(image));

        updateThumbnails(images); 
    } catch (error) {
        console.error("Error generating thumbnails:", error);
    }
}

function updateThumbnails(images) {
    const thumbnailElements = document.querySelectorAll('.tw-cursor-pointer img');
    if (images.length < thumbnailElements.length) {
        console.warn("Less generated images than thumbnails. Some thumbnails won't be updated.");
    }

    thumbnailElements.forEach((imgElement, index) => {
        if (images[index]) {
            imgElement.src = images[index];
        }
    });
}

window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const fromEdit = urlParams.get('from');

    if (fromEdit === 'edit') {
        const editedImage = localStorage.getItem('imageToEdit');
        if (editedImage) {
            const thumbnails = document.querySelectorAll('.tw-cursor-pointer img');
            thumbnails.forEach((img) => {
                if (img.dataset.original === localStorage.getItem('originalImage')) {
                    img.src = editedImage;
                }
            });
        }
    }

    await generateThumbnailsFromPrompt();
};

const styles = `
    @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    [class^="grade-"] {
        background-size: 200% 200%;
        animation: gradient 3s ease infinite;
    }

    .grade-aaa { background: linear-gradient(45deg, #00A300, #2ECC71, #00A300); }
    .grade-b   { background: linear-gradient(45deg, #FFA500, #FF8C00, #FFA500); }
    .grade-e   { background: linear-gradient(45deg, #FF0000, #D50000, #FF0000); }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);