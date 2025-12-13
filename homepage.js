import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBaeqe_--Me5w9mTz0jnEMqlAqwm63Le7A", // Replace with your actual API key
    authDomain: "davetech-movie-management.firebaseapp.com",
    projectId: "davetech-movie-management",
    storageBucket: "davetech-movie-management.firebasestorage.app",
    messagingSenderId: "228063967069",
    appId: "1:228063967069:web:473243916b9f724b101ab4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Pass the app instance to getAuth
const db = getFirestore(app); // Pass the app instance to getFirestore

// Function to update UI with user data
function updateUserInterface(userData) {
    document.getElementById('loggedUserFName').innerText = userData.firstName || '';
    document.getElementById('loggedUserLName').innerText = userData.lastName || '';
    document.getElementById('loggedUserEmail').innerText = userData.email || '';

    // Update profile picture initials
    const initials = `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`;
    document.getElementById('profileInitials').innerText = initials.toUpperCase();
}

// Handle navigation
document.getElementById('profileBtn').addEventListener('click', () => {
    document.getElementById('welcomeSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
});

document.getElementById('homeBtn').addEventListener('click', () => {
    document.getElementById('welcomeSection').style.display = 'block';
    document.getElementById('profileSection').style.display = 'none';
});

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                updateUserInterface(userData);
            } else {
                console.log('No document found for user');
                window.location.href = "index.html"; // Redirect if no user data
            }
        } catch (error) {
            console.error("Error getting user document:", error);
            window.location.href = "index.html"; // Redirect on error
        }
    } else {
        // No user is signed in
        window.location.href = "index.html"; // Redirect if not logged in
    }
});

// Logout functionality
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        // localStorage.removeItem('loggedInUserId');  No longer needed if redirecting
        window.location.href = "index.html";
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});

const arrows = document.querySelectorAll(".arrow");
const movieLists = document.querySelectorAll(".movie-list");

arrows.forEach((arrow, i) => {
  const itemNumber = movieLists[i].querySelectorAll("img").length;
  let clickCounter = 0;
  arrow.addEventListener("click", () => {
    const ratio = Math.floor(window.innerWidth / 270);
    clickCounter++;
    if (itemNumber - (4 + clickCounter) + (4 - ratio) >= 0) {
      movieLists[i].style.transform = `translateX(${
        movieLists[i].computedStyleMap().get("transform")[0].x.value - 300
      }px)`;
    } else {
      movieLists[i].style.transform = "translateX(0)";
      clickCounter = 0;
    }
  });

  console.log(Math.floor(window.innerWidth / 270));
});

//TOGGLE

const ball = document.querySelector(".toggle-ball");
const items = document.querySelectorAll(
  ".container,.movie-list-title,.navbar-container,.sidebar,.left-menu-icon,.toggle"
);

ball.addEventListener("click", () => {
  items.forEach((item) => {
    item.classList.toggle("active");
  });
  ball.classList.toggle("active");
});

