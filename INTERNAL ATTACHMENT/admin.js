// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBaeqe_--Me5w9mTz0jnEMqlAqwm63Le7A",
    authDomain: "davetech-movie-management.firebaseapp.com",
    projectId: "davetech-movie-management",
    storageBucket: "davetech-movie-management.appspot.com",
    messagingSenderId: "228063967069",
    appId: "1:228063967069:web:473243916b9f724b101ab4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// DOM Elements
const addMovieBtn = document.getElementById('addMovieBtn');
const modalOverlay = document.getElementById('modalOverlay');
const addMovieModal = document.getElementById('addMovieModal');
const addMovieForm = document.getElementById('addMovieForm');
const cancelBtn = document.getElementById('cancelBtn');
const logoutBtn = document.getElementById('logout');
const movieList = document.getElementById('movieList');

// Show Message Function
function showMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${isError ? 'bg-red-500' : 'bg-green-500'} text-white p-3 rounded fixed top-5 right-5 shadow-lg`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Modal Functions
function openModal() {
    modalOverlay.classList.add('active');
    addMovieModal.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    addMovieModal.classList.remove('active');
    addMovieForm.reset();
}

// Fetch Movies
async function fetchMovies() {
    movieList.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        querySnapshot.forEach((doc) => {
            const movie = doc.data();
            movieList.innerHTML += `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">${movie.title}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${movie.genre}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${movie.language}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="deleteMovie('${doc.id}')" 
                                class="text-red-600 hover:text-red-900">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Add Movie Function
async function addMovie(event) {
    event.preventDefault();

    const movieData = {
        title: document.getElementById('movieTitle').value,
        genre: document.getElementById('movieGenre').value,
        language: document.getElementById('movieLanguage').value,
        thumbnail: document.getElementById('movieThumbnail').value,
        video: document.getElementById('movieVideo').value,
        description: document.getElementById('movieDescription').value,
        timestamp: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "movies"), movieData);
        showMessage('Movie added successfully!');
        closeModal();
        fetchMovies();
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Delete Movie Function
window.deleteMovie = async (movieId) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
        await deleteDoc(doc(db, "movies", movieId));
        showMessage('Movie deleted successfully!');
        fetchMovies();
    } catch (error) {
        showMessage(error.message, true);
    }
};

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed. User:", user);
    if (!user) {
        console.warn("No user found. Redirecting...");
        window.location.href = 'index.html';
    }
});

// Event Listeners
addMovieBtn.addEventListener('click', openModal);
modalOverlay.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
addMovieForm.addEventListener('submit', addMovie);
logoutBtn.addEventListener('click', () => signOut(auth));

// Initial Load
fetchMovies();
