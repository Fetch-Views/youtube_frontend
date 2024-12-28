document.getElementById('registerForm')?.addEventListener('submit', async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page
    console.log("auth.js loaded successfully!");
    // Collecte des données du formulaire
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Envoi des données au backend
        const response = await fetch('http://127.0.0.1:8000/api/users/sign_up/', {
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
            alert('Account created successfully!');
            window.location.href = '/login.html'; // Redirection après succès
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
        // Envoi de la requête POST pour authentifier
        const response = await fetch('http://127.0.0.1:8000/api/users/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // Stocker les tokens et infos utilisateur dans le localStorage
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            localStorage.setItem('userId', data.user_id);
            localStorage.setItem('userEmail', data.email);

            alert('Login successful!');
            window.location.href = '/gallery.html';
        } else {
            alert(data.error || 'Invalid credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to the server.');
    }
});

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        alert('Session expired. Please log in again.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/users/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('accessToken', data.access); // Mettre à jour le token d'accès
        } else {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to refresh access token.');
    }
}

function checkAuth() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

function isProtectedPage() {
    const protectedPages = [
        'edit_thumbnail.html',
        'dashboard.html',
        'thumbnails.html',
        'thumbnails_generator.html',
        'thumbnails_generator_with_thumbnail.html',
        'heartlist.html',
        'workflow.html',
        'planify_video.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    return protectedPages.includes(currentPage);
}

// Fonction pour afficher l'email de l'utilisateur
function displayUserEmail() {
    const userEmail = localStorage.getItem('userEmail');
    const emailElement = document.getElementById('userEmail');
    if (emailElement && userEmail) {
        emailElement.textContent = userEmail;
    }
}

// Fonction de déconnexion
function signOut() {
    // Supprimer les tokens et infos utilisateur
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    // Rediriger vers la page de login
    window.location.href = '/login.html';
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
