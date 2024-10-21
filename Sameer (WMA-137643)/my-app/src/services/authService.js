import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Import Firestore config from your firebaseConfig.js file
import Swal from 'sweetalert2'; // Import SweetAlert for the animated alerts

// Function to handle user signup
export const signUpUser = async (name, email, password, phone) => {
  const auth = getAuth();
  try {
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Save additional user info in Firestore
    await addDoc(collection(db, "users"), {
      uid: user.uid,  // Store user UID from Firebase Authentication
      name: name,     // Save additional info like name, phone
      email: email,
      phone: phone,
      createdAt: new Date(),
    });

    // Step 3: Show success message and redirect to dashboard
    console.log("User successfully created and stored in Firestore!");
    showSuccessAlert(); // Show success notification
    setTimeout(() => {
      window.location.href = "/dashboard"; // Redirect to dashboard after success
    }, 2000);

  } catch (error) {
    // Show error message if something goes wrong
    console.error("Error signing up user: ", error);
    showErrorAlert(error.message); // Show error notification
  }
};

// Success and Error Alert Messages

const showSuccessAlert = () => {
  Swal.fire({
    icon: 'success',
    title: 'Account Created!',
    text: 'You have successfully created your account.',
    timer: 3000, // Automatically close after 3 seconds
    showConfirmButton: false,
  });
};

const showErrorAlert = (message) => {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message,
    timer: 3000, // Automatically close after 3 seconds
    showConfirmButton: false,
  });
};
