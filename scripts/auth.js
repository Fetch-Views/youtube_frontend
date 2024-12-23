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
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupérer les valeurs des champs
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    try {
        // Envoi de la requête POST au backend Django
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

        // Traitement de la réponse
        const data = await response.json();

        if (response.ok) {
            // Succès de la connexion
            alert('Login successful!');
            console.log('User ID:', data.user_id);
            // Redirection vers une page protégée (par exemple, le dashboard)
            window.location.href = '/index.html';
        } else {
            // Afficher l'erreur
            alert(data.error || 'Invalid credentials.');
        }
    } catch (error) {
        // Gérer les erreurs de connexion réseau
        console.error('Error:', error);
        alert('Failed to connect to the server.');
    }
});

