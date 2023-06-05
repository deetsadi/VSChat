// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, set, onValue } from "firebase/database";

const { getDatabase, ref, set } = require('firebase/database')
const { initializeApp } = require('firebase/app')

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTsGEWfv3fakbUhiKzc9AiBXiS-kAyX3g",
  authDomain: "codesearch-91204.firebaseapp.com",
  databaseURL: "https://codesearch-91204-default-rtdb.firebaseio.com",
  projectId: "codesearch-91204",
  storageBucket: "codesearch-91204.appspot.com",
  messagingSenderId: "637948241608",
  appId: "1:637948241608:web:46962b6d5b609ee12067fd",
  databaseURL: "https://codesearch-91204-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
initializeApp(firebaseConfig);

async function writeUserData(userId, email, apiKey) {
    const db = getDatabase();
    return set(ref(db, 'users/' + userId), {
      email: email,
      apiKey : apiKey
    })
  }

exports.writeUserData = writeUserData;
