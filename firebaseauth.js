// firebaseauth.js
// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    signOut,
    deleteUser
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import {
    getFirestore,
    setDoc,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase configuration: loaded from window.FIREBASE_CONFIG injected by a local file
const firebaseConfig = (() => {
    if (window.FIREBASE_CONFIG && typeof window.FIREBASE_CONFIG === "object") {
        return window.FIREBASE_CONFIG;
    }
    console.error("Missing window.FIREBASE_CONFIG. Ensure config.local.js is loaded before firebaseauth.js.");
    throw new Error("Firebase config not found. Create config.local.js and include it before this script.");
})();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if running on localhost
const isLocalhost = window.location.hostname === "localhost" || 
                    window.location.hostname === "127.0.0.1" ||
                    window.location.protocol === "file:";

console.log("🌐 Running on:", isLocalhost ? "localhost" : "production");

// Helper function
function showMessage(message, elementId, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
    }
}

// ---------------------------------------------------------
// SIGN UP - Simplified for local testing
// ---------------------------------------------------------
document.getElementById('submitSignUp')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    if (!email || !password || !firstName || !lastName) {
        showMessage("All fields required", "signUpMessage", true);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
            email,
            firstName,
            lastName,
            role: "user",
            createdAt: new Date(),
            // Auto-verify for local testing
            emailVerified: isLocalhost
        });

        // Only send verification email if NOT on localhost
        if (!isLocalhost) {
            await sendEmailVerification(user);
            showMessage("Registered! Check email for verification.", "signUpMessage", false);
        } else {
            console.log("✅ Localhost: Skipping email verification");
            showMessage("✅ Registration successful! Email verification skipped for local testing.", "signUpMessage", false);
        }

        // Auto-login for localhost testing
        if (isLocalhost) {
            setTimeout(() => {
                // Auto-fill login form and submit
                document.getElementById('email').value = email;
                document.getElementById('password').value = password;
                document.getElementById('submitSignIn').click();
            }, 1000);
        }

    } catch (error) {
        console.error("Signup error:", error);
        showMessage("Error: " + error.message, "signUpMessage", true);
    }
});

// ---------------------------------------------------------
// SIGN IN - Email verification bypassed for localhost
// ---------------------------------------------------------
document.getElementById('submitSignIn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage("Email and password required", "signInMessage", true);
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // LOCALHOST BYPASS: Skip email verification check
        if (!user.emailVerified && !isLocalhost) {
            showMessage("Please verify your email first", "signInMessage", true);
            await signOut(auth);
            return;
        }
        
        // For localhost, show warning but allow login
        if (!user.emailVerified && isLocalhost) {
            console.log("⚠️ Localhost: Bypassing email verification");
            showMessage("⚠️ Email not verified - Login allowed for local testing", "signInMessage", false);
            
            // Auto-mark as verified in Firestore for local testing
            try {
                await updateDoc(doc(db, "users", user.uid), {
                    emailVerified: true
                });
                console.log("✅ Auto-marked as verified for local testing");
            } catch (firestoreError) {
                console.log("Note: Couldn't update Firestore, but continuing anyway");
            }
        }

        // Get user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            localStorage.setItem('user', JSON.stringify(userDoc.data()));
            showMessage("Login successful!", "signInMessage", false);
            
            setTimeout(() => {
                window.location.href = "homepage.html";
            }, 1000);
        } else {
            showMessage("User data not found", "signInMessage", true);
        }

    } catch (error) {
        console.error("Login error:", error);
        
        if (error.code === 'auth/invalid-credential') {
            showMessage("Invalid email or password", "signInMessage", true);
        } else {
            showMessage("Login failed: " + error.message, "signInMessage", true);
        }
    }
});

// ---------------------------------------------------------
// AUTH STATE - Bypass verification redirects on localhost
// ---------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['index.html', 'signup.html', ''];
    const isPublicPage = publicPages.includes(currentPage);

    if (user) {
        // LOCALHOST BYPASS: Don't require verification
        if (!user.emailVerified && !isLocalhost) {
            console.log("Email not verified, redirecting to login");
            if (!isPublicPage) {
                await signOut(auth);
                window.location.href = "index.html";
            }
            return;
        }

        // Get user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            console.log("User logged in:", userDoc.data().email);
            
            // Redirect to homepage if on login page
            if (isPublicPage) {
                window.location.href = "homepage.html";
            }
        }
    } else {
        // Not logged in - redirect to login if on protected page
        if (!isPublicPage) {
            window.location.href = "index.html";
        }
    }
});

// Logout
document.getElementById('logout')?.addEventListener('click', async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    window.location.href = "index.html";
});

// Helper function to update Firestore (needs to be imported)
async function updateDoc(docRef, data) {
    // This is a simplified version - you should import updateDoc from firestore
    const { updateDoc: firestoreUpdate } = await import("https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js");
    return firestoreUpdate(docRef, data);
}

console.log("✅ Auth system loaded - Localhost mode:", isLocalhost);