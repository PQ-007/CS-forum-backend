import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Profile } from "../pages/admin/users-list";

class AdminService {
  private static instance: AdminService;

  private constructor() {}

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Fetch a user by UID
  public async getUser(uid: string): Promise<Profile | null> {
    try {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Profile;
      } else {
        console.warn("No user found for UID:", uid);
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching user:", error.message);
      throw error;
    }
  }


  // Update user information
  public async updateUser(
    uid: string,
    updatedData: Partial<Profile>
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, updatedData);
    } catch (error: any) {
      console.error("Error updating user:", error.message);
      throw error;
    }
  }

  // Create a new user
  public async createUser(uid: string, userData: Profile): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        ...userData,
        joinedDate: new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      console.error("Error creating user:", error.message);
      throw error;
    }
  }

  // Delete a user
  public async deleteUser(uid: string): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      await deleteDoc(userRef);
    } catch (error: any) {
      console.error("Error removing user:", error.message);
      throw error;
    }
  }

  // Filter users by type
  public async getUsersByType(type: string): Promise<Profile[]> {
    try {
      const usersCollection = collection(db, "users");
      const typeQuery = query(usersCollection, where("type", "==", type));
      const querySnapshot = await getDocs(typeQuery);
      const users: Profile[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as Profile & { id: string });
      });
      
      return users;
    } catch (error: any) {
      console.error(`Error fetching users by type ${type}:`, error.message);
      throw error;
    }
  }

  // Filter users by departure (department)
  public async getUsersByDeparture(departure: string): Promise<Profile[]> {
    try {
      const usersCollection = collection(db, "users");
      const departureQuery = query(usersCollection, where("departure", "==", departure));
      const querySnapshot = await getDocs(departureQuery);
      const users: Profile[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as Profile & { id: string });
      });
      
      return users;
    } catch (error: any) {
      console.error(`Error fetching users by departure ${departure}:`, error.message);
      throw error;
    }
  }

  // Search users by name or email
  public async searchUsers(searchText: string): Promise<Profile[]> {
    try {
      // Get all users first (Firestore doesn't support direct text search)
      const users = await this.getAllUsers();
      
      // Filter locally
      return users.filter(user => 
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    } catch (error: any) {
      console.error("Error searching users:", error.message);
      throw error;
    }
  }

  // Get all users
  public async getAllUsers(): Promise<Profile[]> {
    try {
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);
      const users: Profile[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as Profile & { id: string });
      });
      return users;
    } catch (error: any) {
      console.error("Error fetching all users:", error.message);
      throw error;
    }
  }
}


export default AdminService.getInstance();