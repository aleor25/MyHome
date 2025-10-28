import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

    apiKey: "AIzaSyDXMcZjJT1R-GUCE45A-x3A3eZGzVRfPZU",
    authDomain: "myhome-b3352.firebaseapp.com",
    projectId: "myhome-b3352",
    storageBucket: "myhome-b3352.appspot.com",
    messagingSenderId: "856936315309",
    appId: "1:856936315309:android:84455f8df7990fe1920924"

}


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
