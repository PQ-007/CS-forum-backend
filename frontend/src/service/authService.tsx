import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions

class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {}

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  // Save user to Firestore
  private async saveUserToFirestore(user: any, name: string): Promise<void> {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        type: "student",
        displayName: name,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    } catch (error: any) {
      console.error("Error saving user data to Firestore:", error.message);
      throw error;
    }
  }

  public async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  }

  // Register with email & password
  public async register(
    email: string,
    password: string,
    name: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Registered user:", userCredential.user);
      await this.saveUserToFirestore(userCredential.user, name);
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      throw error;
    }
  }

  public async loginWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(auth, provider);

      await this.saveUserToFirestore(
        result.user,
        result.user.displayName || "user"
      );
    } catch (error: any) {
      console.error("Google login failed:", error.message);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      throw error;
    }
  }
}

export default AuthenticationService.getInstance();
