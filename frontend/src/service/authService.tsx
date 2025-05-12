import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {}

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  private async saveUserToFirestore(
    user: User,
    name: string,
    year?: number
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        type: "student",
        displayName: name,
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        ...(year && { year }),
      });
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Error saving user data to Firestore:", error.message);
      } else {
        console.error("Unexpected error saving user data:", error);
      }
      throw error;
    }
  }

  public async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Login failed:", error.message);
      } else {
        console.error("Unexpected login error:", error);
      }
      throw error;
    }
  }

  public async register(
    email: string,
    password: string,
    name: string,
    year?: number
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Registered user:", userCredential.user);
      await this.saveUserToFirestore(userCredential.user, name, year);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Registration failed:", error.message);
      } else {
        console.error("Unexpected registration error:", error);
      }
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
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Google login failed:", error.message);
      } else {
        console.error("Unexpected Google login error:", error);
      }
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error("Logout failed:", error.message);
      } else {
        console.error("Unexpected logout error:", error);
      }
      throw error;
    }
  }
}

export default AuthenticationService.getInstance();
