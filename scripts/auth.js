document.getElementById('registerForm')?.addEventListener('submit', async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Collecte des données du formulaire
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    // Vérification si le mot de passe et la confirmation correspondent
    if (password !== confirmPassword) {
        alert('The password and confirmation password do not match. Please try again.');
        return; // Arrête l'exécution si les mots de passe ne correspondent pas
    }

    try {
        // Envoi des données au backend
        const response = await fetch('https://web-production-5b55f.up.railway.app/api/users/sign_up/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Your account needs to be reviewed by someone from the team. To join the beta, contact: contact@fetchviews.com');
            // Redirection ou autre action après succès
            // window.location.href = '/login.html';
        } else {
            alert(data.error || 'An error occurred during registration.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to the server.');
    }
});


document.getElementById('loginForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    try {
        const csrftoken = getCookie('csrftoken'); 

        const response = await fetch('https://web-production-5b55f.up.railway.app/api/users/login/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken, 
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = '/dashboard.html';
        } else {
            console.log(data.error);
            alert(data.error || 'Invalid credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to the server.');
    }
});


async function checkAuth() {
    try {
        const response = await fetch('https://web-production-5b55f.up.railway.app/api/users/user_profile/', {
            method: 'GET',
            credentials: 'include', 
        });

        if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('email', userData.email);
            localStorage.setItem('has_refresh_token', userData.has_youtube_token)
            return true;
        } else if (response.status === 401 || response.status === 403) {
            console.warn('User not authenticated. Redirecting to login.');
            window.location.href = '/login.html';
            return false;
        } else {
            console.error('Unexpected response:', response);
            alert('An error occurred. Please try again.');
            return false;
        }
    } catch (error) {
        console.error('Error during authentication check:', error);
        alert('Failed to connect to the server.');
        return false;
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

function isProtectedPage() {
    const protectedPages = [
        'edit_thumbnail.html',
        'dashboard.html',
        'thumbnails_generator.html',
        'thumbnails_generator_with_thumbnail.html',
        'heartlist.html',
        'workflow.html',
        'planify_video.html',
        'profile.html',
        'gallery.html',
        'myvideos.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    return protectedPages.includes(currentPage);
}

// Fonction pour afficher l'email de l'utilisateur
function displayUserEmail() {
    const userEmail = localStorage.getItem('email');
    const emailElement = document.getElementById('userEmail');
    if (emailElement && userEmail) {
        emailElement.textContent = userEmail;
    }
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

async function signOut() {
    try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch('https://web-production-5b55f.up.railway.app/api/users/logout/', {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken, 
            },
        });

        if (response.ok) {
            alert('You have been logged out successfully.');
            window.location.href = '/index.html'; 
            localStorage.removeItem('has_refresh_token')
            deleteCookie('csrftoken');
        } else {
            const errorData = await response.json();
            console.error('Logout error:', errorData);
            alert('Failed to log out. Please try again.');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Failed to connect to the server.');
    }
}


document.addEventListener('DOMContentLoaded', function() {
    if (isProtectedPage()) {
        checkAuth();
        displayUserEmail(); // Afficher l'email de l'utilisateur
    }
    
    // Fermer le dropdown quand on clique en dehors
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('profileDropdown');
        const profileButton = event.target.closest('button');
        
        if (!profileButton && !dropdown?.contains(event.target)) {
            dropdown?.classList.add('tw-hidden');
        }
    });
});


async function updateYoutubeButtonColor() {
    const youtubeButton = document.getElementById('youtubeButton');
    if (!youtubeButton) {
        console.error('Button with ID "youtubeButton" not found.');
        return;
    }

    const refreshToken = localStorage.getItem('has_refresh_token');

    if (refreshToken == "true") {
        youtubeButton.style.backgroundColor = 'green';
        youtubeButton.textContent = 'YouTube Connected';
    } else {
        youtubeButton.style.backgroundColor = 'red';
        youtubeButton.textContent = 'Connect to YouTube'; 
    }
}

document.addEventListener('DOMContentLoaded', updateYoutubeButtonColor);