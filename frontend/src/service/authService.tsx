import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initialProfileData } from "./initialDatas";
import { Profile } from "../pages/student/profile/type";
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

  // Save user to Firestore
  private async saveUserToFirestore(
    user: any,
    name: string,
    year?: number
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", user.uid);
      const profileRef = doc(db, "profiles", user.uid);

      // Save basic user info
      await setDoc(userRef, {
        year: year ?? 1,
        email: user.email,
        type: "student",
        displayName: name,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });

      // Set initial profile data if not exists
      const docSnap = await getDoc(profileRef);
      if (!docSnap.exists()) {
        const userProfile: Profile = {
          ...initialProfileData,
          name,
          email: user.email,
          photoUrl: user.photoURL,
          type: "student",
          joinedDate: new Date().toISOString(),
        };

        await setDoc(profileRef, userProfile);
      }
    } catch (error: any) {
      console.error("Error saving user data to Firestore:", error.message);
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
