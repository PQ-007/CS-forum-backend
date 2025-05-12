import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Profile } from "../pages/student/profile/type";

class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  // Fetch a user's profile by UID
  public async getProfile(uid: string): Promise<Profile | null> {
    try {
      const profileRef = doc(db, "profiles", uid);
      const docSnap = await getDoc(profileRef);

      if (docSnap.exists()) {
        return docSnap.data() as Profile;
      } else {
        console.warn("No profile found for UID:", uid);
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      throw error;
    }
  }

  // Update a user's profile by UID
  public async updateProfile(uid: string, updatedData: Partial<Profile>): Promise<void> {
    try {
      const profileRef = doc(db, "profiles", uid);
      await updateDoc(profileRef, updatedData);
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      throw error;
    }
  }

  // (Optional) Reset profile to default
  public async resetProfile(uid: string, defaultProfile: Profile): Promise<void> {
    try {
      const profileRef = doc(db, "profiles", uid);
      await setDoc(profileRef, defaultProfile);
    } catch (error: any) {
      console.error("Error resetting profile:", error.message);
      throw error;
    }
  }
}

export default ProfileService.getInstance();
