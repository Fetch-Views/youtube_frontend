const BACKEND_URL = window.location.hostname === "127.0.0.1" 
        ? "http://127.0.0.1:8000" 
        : "https://web-production-5b55f.up.railway.app";

document.getElementById('registerForm')?.addEventListener('submit', async function (event) {
    event.preventDefault(); 

    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (password !== confirmPassword) {
        alert('The password and confirmation password do not match. Please try again.');
        return; 
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/users/sign_up/`, {
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
            window.location.href = '/login.html';
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
        const response = await fetch(`${BACKEND_URL}/api/users/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            
            window.location.href = '/thumbnails_generator.html';
        } else {
            console.log(data.error);
            alert(data.error || 'Invalid credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to the server.');
    }
});

async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem('access_token');

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
        console.log('Access token expired, trying to refresh...');
        const refreshed = await refreshToken();

        if (refreshed) {
            token = localStorage.getItem('access_token');
            options.headers['Authorization'] = `Bearer ${token}`;
            response = await fetch(url, options);
        } else {
            alert('Session expired. Please log in again.');
            window.location.href = '/login.html';
            return;
        }
    }

    return response.ok ? await response.json() : null;
}

async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        console.log('No refresh token available.');
        return false;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/users/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('access_token', data.access); 
            return true;
        } else {
            console.log('Failed to refresh token:', data);
            return false;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
}

async function checkAuth() {
    try {
        let response = await fetchWithAuth(`${BACKEND_URL}/api/users/user_profile/`);

        if (response) {
            localStorage.setItem('email', response.email);
            localStorage.setItem('has_refresh_token', response.has_youtube_token);
            return true;
        } else {
            console.warn('User not authenticated. Redirecting to login.');
            window.location.href = '/login.html';
            return false;
        }
    } catch (error) {
        console.error('Error during authentication check:', error);
        alert('Failed to connect to the server.');
        return false;
    }
}

function isProtectedPage() {
    const protectedPages = [
        'thumbnails_generator.html',
        'heartlist.html',
        'profile.html',
        'gallery.html',
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    return protectedPages.includes(currentPage);
}

function displayUserEmail() {
    const userEmail = localStorage.getItem('email');
    const emailElement = document.getElementById('userEmail');
    if (emailElement && userEmail) {
        emailElement.textContent = userEmail;
    }
}

async function signOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('has_refresh_token');

    alert('You have been logged out successfully.');
    window.location.href = '/index.html';
}

const CREDIT_TYPES = {
    titleCredits: { elementId: 'titleCredits', key: 'title_credits' },
    imageCredits: { elementId: 'imageCredits', key: 'images_credits' },
    abCredits: { elementId: 'abCredits', key: 'ab_credits' }
};

async function fetchAllCredits() {
    try {
        const response = await fetchWithAuth(`${BACKEND_URL}/api/users/credits/`, {
            method: 'GET',
        });
        if (!response) {
            throw new Error('Error retrieveing user credits');
        }
        const data = response;
        return data.credits;;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function updateCreditDisplay(elementId, value) {
    const element = document.querySelector(`#${elementId} .credit-count`);
    if (value !== null) {
        element.textContent = value;
    } else {
        element.textContent = '?';
        element.classList.add('tw-text-red-500');
    }
}

async function updateAllCredits() {
    const credits = await fetchAllCredits();
    
    if (credits) {
        Object.values(CREDIT_TYPES).forEach(type => {
            updateCreditDisplay(type.elementId, credits[type.key]);
        });
    } else {
        Object.values(CREDIT_TYPES).forEach(type => {
            updateCreditDisplay(type.elementId, null);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (isProtectedPage()) {
        checkAuth();
        displayUserEmail(); 
        updateAllCredits();
    }
    
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('profileDropdown');
        const profileButton = event.target.closest('button');
        
        if (!profileButton && !dropdown?.contains(event.target)) {
            dropdown?.classList.add('tw-hidden');
        }
    });
});