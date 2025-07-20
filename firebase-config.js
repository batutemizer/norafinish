// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC9S4swtLTwQPPOnGBDp0DtBuWWVyNu_Sw",
    authDomain: "orason-74e2f.firebaseapp.com",
    projectId: "orason-74e2f",
    storageBucket: "orason-74e2f.firebasestorage.app",
    messagingSenderId: "668082331524",
    appId: "1:668082331524:web:7147dc353f28d464c187d1",
    measurementId: "G-KMK22WJ1X1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseAnalytics = analytics; 