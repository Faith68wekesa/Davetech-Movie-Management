// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { 
    getFirestore, 
    setDoc, 
    getDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBaeqe_--Me5w9mTz0jnEMqlAqwm63Le7A",
    authDomain: "davetech-movie-management.firebaseapp.com",
    projectId: "davetech-movie-management",
    storageBucket: "davetech-movie-management.appspot.com", // Fixed the incorrect URL
    messagingSenderId: "228063967069",
    appId: "1:228063967069:web:473243916b9f724b101ab4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Function to show messages
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    if (messageDiv) {
        messageDiv.style.display = "block";
        messageDiv.innerHTML = message;
        messageDiv.style.opacity = 1;

        setTimeout(() => {
            messageDiv.style.opacity = 0;
        }, 5000);
    }
}

// Register new user
document.getElementById('submitSignUp')?.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);
        showMessage("Email verification link sent!", "signUpMessage");

        // Save user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            firstName: firstName,
            lastName: lastName,
            role: "user" // Default role
        });

        showMessage("Account Created Successfully", "signUpMessage");

        // Redirect to login page after a delay
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showMessage('Email Address Already Exists !!!', 'signUpMessage');
        } else {
            showMessage('Unable to create user', 'signUpMessage');
        }
    }
});

// Sign in existing user
document.getElementById('submitSignIn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    console.log("Login button clicked, preventing refresh..."); // Debugging log

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showMessage("Please fill in all fields!", "signInMessage");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            showMessage("Please verify your email before logging in", "signInMessage");
            return;
        }

        localStorage.setItem('loggedInUserId', user.uid);
        showMessage("Login Successful", "signInMessage");

        setTimeout(() => {
            window.location.href = "homepage.html";
        }, 2000);

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            showMessage("No account found with this email.", "signInMessage");
        } else if (error.code === 'auth/wrong-password') {
            showMessage("Incorrect password. Try again.", "signInMessage");
        } else {
            showMessage("Login failed: " + error.message, "signInMessage");
        }
    }
});

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    const currentPage = window.location.pathname;

    if (user) {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                updateUserInterface(userData);
            } else {
                console.log("No document found for user");
                if (currentPage !== "/index.html") {
                    window.location.href = "index.html";
                }
            }
        } catch (error) {
            console.error("Error getting user document:", error);
            if (currentPage !== "/index.html") {
                window.location.href = "index.html";
            }
        }
    } else {
        // Redirect only if the user is on a restricted page
        if (currentPage !== "/index.html" && currentPage !== "/signup.html") {
            window.location.href = "index.html";
        }
    }
});

// Update UI with user data
function updateUserInterface(userData) {
    const fNameElement = document.getElementById('loggedUserFName');
    const lNameElement = document.getElementById('loggedUserLName');
    const emailElement = document.getElementById('loggedUserEmail');
    const profileInitialsElement = document.getElementById('profileInitials');

    if (fNameElement) fNameElement.innerText = userData.firstName || '';
    if (lNameElement) lNameElement.innerText = userData.lastName || '';
    if (emailElement) emailElement.innerText = userData.email || '';

    // Update profile picture initials
    if (profileInitialsElement) {
        const initials = `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`;
        profileInitialsElement.innerText = initials.toUpperCase();
    }
}

// Logout functionality
document.getElementById('logout')?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('loggedInUserId');
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error signing out:", error);
    }
});
