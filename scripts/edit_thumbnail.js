var selectedElement = null;

function toggleYouTubeConnection() {
    const button = document.getElementById('youtubeButton');
    if (button.classList.contains('tw-bg-red-600')) {
        button.classList.remove('tw-bg-red-600', 'hover:tw-bg-red-700');
        button.classList.add('tw-bg-green-600', 'hover:tw-bg-green-700');
        button.querySelector('span').textContent = 'Connected to YouTube';
    } else {
        button.classList.remove('tw-bg-green-600', 'hover:tw-bg-green-700');
        button.classList.add('tw-bg-red-600', 'hover:tw-bg-red-700');
        button.querySelector('span').textContent = 'Connect to YouTube';
    }
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const imgUrl = urlParams.get('img');
    if (imgUrl) {
        const img = new Image();
        img.onload = function() {
            document.querySelector('.tw-aspect-video img').src = imgUrl;
        };
        img.src = imgUrl;
    }
}

function goBack() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
            
    let returnPage;
    if (source === 'generator_with_thumbnail') {
        returnPage = 'thumbnails_generator_with_thumbnail.html';
    } else {
        returnPage = 'thumbnails_generator.html';
    }
            
    window.location.href = `${returnPage}?from=edit`;
}

window.onload = function() {
    const imageToEdit = localStorage.getItem('generatedThumbnail');
    localStorage.setItem("previous_page", "edit_thumbnail.html")
    if (imageToEdit) {
        document.querySelector('.tw-aspect-video img').src = imageToEdit;
    }
}

var currentText;
let rectangleColor = 'rgb(255, 0, 0)';

function addText(fontClass) {
    const imgContainer = document.getElementById('imgContainer');
    const containerRect = imgContainer.getBoundingClientRect();

    var text = document.createElement('div');
    text.contentEditable = true;
    text.style.position = 'absolute';
    text.style.color = 'white';
    text.style.fontSize = '25px';
    text.innerText = 'Write a title';
    text.classList.add(fontClass);
    imgContainer.appendChild(text);
    text.style.left = `${containerRect.width / 2}px`; 
    text.style.top = `${containerRect.height / 2}px`; 

    text.addEventListener('mousedown', function(event) {
        shiftX = event.clientX - text.getBoundingClientRect().left;
        shiftY = event.clientY - text.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            const containerRect = imgContainer.getBoundingClientRect();
            const textRect = text.getBoundingClientRect();

            let newLeft = pageX - shiftX - containerRect.left;
            let newTop = pageY - 4*shiftY - containerRect.top;

            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft + textRect.width > containerRect.width) newLeft = containerRect.width - textRect.width;
            if (newTop + textRect.height > containerRect.height) newTop = containerRect.height - textRect.height;

            text.style.left = `${newLeft}px`;
            text.style.top = `${newTop}px`;
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', function mouseUpHandler() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', mouseUpHandler);
        });
    });

    text.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        var confirmDelete = confirm("Do you want to delete this text?");
        if (confirmDelete) {
            imgContainer.removeChild(text);
        }
    });

    text.addEventListener('click', function() {
        selectedElement = text;
        if (rectangle) rectangle.style.border = 'none';
    });

    currentText = text;
}

function toggleBold() {
    if (currentText) {
        if (currentText.style.fontWeight === 'bold') {
            currentText.style.fontWeight = 'normal';  
        } else {
            currentText.style.fontWeight = 'bold';  
        }
    }
}

function toggleItalic() {
    if (currentText) {
        if (currentText.style.fontStyle === 'italic') {
            currentText.style.fontStyle = 'normal'; 
        } else {
            currentText.style.fontStyle = 'italic'; 
        }
    }
}

function changeColor() {
    const colorPicker = document.getElementById('colorPicker');
    const selectedColor = colorPicker.value;

    if (selectedElement && selectedElement.resizeHandles) {
        selectedElement.style.backgroundColor = selectedColor;

        selectedElement.resizeHandles.forEach(handle => {
            handle.style.backgroundColor = selectedColor;
        });
    }

    if (selectedElement === currentText) {
        currentText.style.color = selectedColor;
    }
}

let rectangle = null;
let isDragging = false;
let offsetX, offsetY;

function addRectangle() {
    const imgContainer = document.getElementById('imgContainer');
    const containerRect = imgContainer.getBoundingClientRect();
    rectangle = document.createElement('div');
    rectangle.style.width = '200px';
    rectangle.style.height = '100px';
    rectangle.style.position = 'absolute';
    rectangle.style.backgroundColor = rectangleColor; 
    rectangle.style.left = `${containerRect.width / 4}px`;  
    rectangle.style.top = `${containerRect.height / 4}px`;
    rectangle.style.border = 'none'; 
    document.getElementById('imgContainer').appendChild(rectangle);

    rectangle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    addResizeHandles(rectangle);

    rectangle.addEventListener('click', function() {
        selectedElement = rectangle;
        if (currentText) currentText.style.border = 'none';
        rectangle.style.border = '2px solid white';  
    });

    rectangle.addEventListener('contextmenu', function(event) {
        event.preventDefault(); 
        var confirmDelete = confirm("Do you want to delete this rectangle?");
        if (confirmDelete) {
            document.getElementById('imgContainer').removeChild(rectangle);
            removeResizeHandles();
        }
    });

    document.addEventListener('click', function(event) {
        if (!rectangle.contains(event.target)) {
            rectangle.style.border = 'none';
        }
    });
}

let resizeHandles = [];

function addResizeHandles(rectangle) {
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const handles = []; 

    positions.forEach(position => {
        const handle = document.createElement('div');
        handle.classList.add('resize-handle', position);
        handle.style.position = 'absolute';
        handle.style.backgroundColor = rectangle.style.backgroundColor; 
        handle.style.width = '10px';
        handle.style.height = '10px';
        handle.style.cursor = `${position}-resize`;

        if (position === 'top-left') {
            handle.style.top = '0';
            handle.style.left = '0';
        } else if (position === 'top-right') {
            handle.style.top = '0';
            handle.style.right = '0';
        } else if (position === 'bottom-left') {
            handle.style.bottom = '0';
            handle.style.left = '0';
        } else if (position === 'bottom-right') {
            handle.style.bottom = '0';
            handle.style.right = '0';
        }

        rectangle.appendChild(handle);
        handles.push(handle);

        handle.addEventListener('mousedown', function(event) {
            event.preventDefault();
            event.stopPropagation();

            const startX = event.clientX;
            const startY = event.clientY;
            const startWidth = rectangle.offsetWidth;
            const startHeight = rectangle.offsetHeight;
            const startLeft = rectangle.offsetLeft;
            const startTop = rectangle.offsetTop;

            const mouseMoveHandler = function(e) {
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                if (position.includes('left')) {
                    newWidth = startWidth - (e.clientX - startX);
                    newLeft = startLeft + (e.clientX - startX);
                }
                if (position.includes('right')) {
                    newWidth = startWidth + (e.clientX - startX);
                }
                if (position.includes('top')) {
                    newHeight = startHeight - (e.clientY - startY);
                    newTop = startTop + (e.clientY - startY);
                }
                if (position.includes('bottom')) {
                    newHeight = startHeight + (e.clientY - startY);
                }

                rectangle.style.width = `${newWidth}px`;
                rectangle.style.height = `${newHeight}px`;
                rectangle.style.left = `${newLeft}px`;
                rectangle.style.top = `${newTop}px`;
            };

            const mouseUpHandler = function() {
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    });

    rectangle.resizeHandles = handles;
}

function removeResizeHandles(rectangle) {
    if (rectangle.resizeHandles) {
        rectangle.resizeHandles.forEach(handle => {
            handle.remove();
        });
        rectangle.resizeHandles = [];
    }
}

function startDrag(e) {
    if (rectangle) {
        isDragging = true;
        rectangle.style.border = '2px solid white';
        offsetX = e.clientX - rectangle.offsetLeft;
        offsetY = e.clientY - rectangle.offsetTop;
    }
}

function drag(e) {
    if (isDragging && rectangle) {
        rectangle.style.left = e.clientX - offsetX + 'px';
        rectangle.style.top = e.clientY - offsetY + 'px';
    }
}

function stopDrag() {
    if (rectangle) {
        rectangle.style.border = 'none';  
    }
    isDragging = false;
}

document.getElementById('download').addEventListener('click', function () {
    const imgContainer = document.getElementById('imgContainer');
    const editableTexts = imgContainer.querySelectorAll('[contenteditable="true"]');

    editableTexts.forEach((text) => {
        const currentTop = parseFloat(text.style.top) || 0;
        const currentLeft = parseFloat(text.style.left) || 0;

        text.setAttribute('data-original-top', currentTop);
        text.setAttribute('data-original-left', currentLeft);

        text.style.top = `${currentTop - 10}px`; 
        text.style.left = `${currentLeft}px`; 
        text.contentEditable = 'false'; 
    });

    if (!imgContainer) {
        console.error('imgContainer not found');
        return;
    }

    document.fonts.ready.then(() => {
        html2canvas(imgContainer, {
            scrollY: -window.scrollY, 
            scale: window.devicePixelRatio, 
            useCORS: true, 
        }).then(function (canvas) {
            const link = document.createElement('a');
            link.download = 'thumbnail.png';
            link.href = canvas.toDataURL('thumbnail/png');
            link.click();

            link.remove();
        }).catch(function (error) {
            console.error('Error while capturing :', error);
        });
    });
});

document.getElementById('nextStepBtn').addEventListener('click', function () {
    const imgContainer = document.getElementById('imgContainer');
    const editableTexts = imgContainer.querySelectorAll('[contenteditable="true"]');

    editableTexts.forEach((text) => {
        const currentTop = parseFloat(text.style.top) || 0;
        const currentLeft = parseFloat(text.style.left) || 0;

        text.setAttribute('data-original-top', currentTop);
        text.setAttribute('data-original-left', currentLeft);

        text.style.top = `${currentTop - 10}px`; 
        text.style.left = `${currentLeft}px`; 
        text.contentEditable = 'false'; 
    });

    document.fonts.ready.then(() => {
        html2canvas(imgContainer, {
            scrollY: -window.scrollY,
            scale: window.devicePixelRatio,
            useCORS: true,
        }).then(function (canvas) {
            const base64Image = canvas.toDataURL();
            localStorage.setItem('selectedThumbnail', base64Image);
            console.log(localStorage.getItem('selectedThumbnail'));
            window.location.href = 'planify_video.html';
        }).catch(function (error) {
            console.error('Error while capturing image:', error);
        }).finally(() => {
            editableTexts.forEach((text) => {
                const originalTop = text.getAttribute('data-original-top');
                const originalLeft = text.getAttribute('data-original-left');

                if (originalTop !== null) text.style.top = `${originalTop}px`;
                if (originalLeft !== null) text.style.left = `${originalLeft}px`;

                text.removeAttribute('data-original-top');
                text.removeAttribute('data-original-left');
                text.contentEditable = 'true'; 
            });
        });
    });
});