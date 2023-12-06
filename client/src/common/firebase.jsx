// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOs87Rh8prOEIg0hfUumzs4H_DMgM68QA",
  authDomain: "blogging-website-49f02.firebaseapp.com",
  projectId: "blogging-website-49f02",
  storageBucket: "blogging-website-49f02.appspot.com",
  messagingSenderId: "921077759348",
  appId: "1:921077759348:web:d014de5111edfd21c18021",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWtihGoogle = async () => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((data) => {
      user = data.user;
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};
