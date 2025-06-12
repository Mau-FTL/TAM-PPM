// src/lib/databaseService.ts
import { app, database } from './firebaseInit'; // Assuming database is now exported from firebaseInit
import { ref, get, set, update, remove, Database } from 'firebase/database';
import { Project, Property } from '../types'; // Assuming you have types defined

class DatabaseService { // Add type imports for User, Document, and Note if they exist
    private db: Database;

    constructor() {
        if (!database) {
            throw new Error("Firebase Realtime Database is not initialized.");
        }
        this.db = database;
    }

    async getProperties(): Promise<Property[]> {
        try {
            const propertiesRef = ref(this.db, 'properties');
            const snapshot = await get(propertiesRef);
            if (snapshot.exists()) {
                const propertiesData = snapshot.val();
                return Object.keys(propertiesData).map(key => ({
                    id: key,
                    ...propertiesData[key]
                })) as Property[];
            } else {
                console.log("No properties available");
                return [];
            }
        } catch (error) {
            console.error("Error fetching properties:", error);
            throw error;
        }
    }

    async addProperty(property: Omit<Property, 'id'>): Promise<string | null> {
        try {
            const newPropertyRef = ref(this.db, 'properties/' + Date.now()); // Simple timestamp as key
            await set(newPropertyRef, property);
            console.log("Property added successfully");
            return newPropertyRef.key;
        } catch (error) {
            console.error("Error adding property:", error);
            throw error;
        }
    }

    async updateProperty(propertyId: string, updates: Partial<Property>): Promise<void> {
        try {
            const propertyRef = ref(this.db, `properties/${propertyId}`);
            await update(propertyRef, updates);
            console.log(`Property ${propertyId} updated successfully`);
        } catch (error) {
            console.error(`Error updating property ${propertyId}:`, error);
            throw error;
        }
    }

    async deleteProperty(propertyId: string): Promise<void> {
        try {
            const propertyRef = ref(this.db, `properties/${propertyId}`);
            await remove(propertyRef);
            console.log(`Property ${propertyId} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting property ${propertyId}:`, error);
            throw error;
        }
    }

    async getProjects(): Promise<Project[]> {
        try {
            const projectsRef = ref(this.db, 'projects');
            const snapshot = await get(projectsRef);
            if (snapshot.exists()) {
                const projectsData = snapshot.val();
                return Object.keys(projectsData).map(key => ({
                    id: key,
                    ...projectsData[key]
                })) as Project[];
            } else {
                console.log("No projects available");
                return [];
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    }

    async addProject(project: Omit<Project, 'id'>): Promise<string | null> {
        try {
            const newProjectRef = ref(this.db, 'projects/' + Date.now()); // Simple timestamp as key
            await set(newProjectRef, project);
            console.log("Project added successfully");
            return newProjectRef.key;
        } catch (error) {
            console.error("Error adding project:", error);
            throw error;
        }
    }

    async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
        try {
            const projectRef = ref(this.db, `projects/${projectId}`);
            await update(projectRef, updates);
            console.log(`Project ${projectId} updated successfully`);
        } catch (error) {
            console.error(`Error updating project ${projectId}:`, error);
            throw error;
        }
    }

    async deleteProject(projectId: string): Promise<void> {
        try {
            const projectRef = ref(this.db, `projects/${projectId}`);
            await remove(projectRef);
            console.log(`Project ${projectId} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
            throw error;
        }
    }

    // --- User Functions ---

    async getUsers(): Promise<User[]> { // Assuming User type exists
        try {
            const usersRef = ref(this.db, 'Users');
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                return Object.keys(usersData).map(key => ({
                    id: key,
                    ...usersData[key]
                })) as User[];
            } else {
                console.log("No users available");
                return [];
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

    async addUser(user: Omit<User, 'id'>): Promise<string | null> { // Assuming User type exists
        try {
            const newUserRef = ref(this.db, 'Users/' + Date.now()); // Simple timestamp as key, adjust if using auth UIDs
            await set(newUserRef, user);
            console.log("User added successfully");
            return newUserRef.key;
        } catch (error) {
            console.error("Error adding user:", error);
            throw error;
        }
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<void> { // Assuming User type exists
        try {
            const userRef = ref(this.db, `Users/${userId}`);
            await update(userRef, updates);
            console.log(`User ${userId} updated successfully`);
        } catch (error) {
            console.error(`Error updating user ${userId}:`, error);
            throw error;
        }
    }

    async deleteUser(userId: string): Promise<void> { // Assuming User type exists
        try {
            const userRef = ref(this.db, `Users/${userId}`);
            await remove(userRef);
            console.log(`User ${userId} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
            throw error;
        }
    }

    // --- Document Functions ---

    async getDocuments(): Promise<Document[]> { // Assuming Document type exists
        try {
            const documentsRef = ref(this.db, 'Documents');
            const snapshot = await get(documentsRef);
            if (snapshot.exists()) {
                const documentsData = snapshot.val();
                return Object.keys(documentsData).map(key => ({
                    id: key,
                    ...documentsData[key]
                })) as Document[];
            } else {
                console.log("No documents available");
                return [];
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
            throw error;
        }
    }

    async addDocument(document: Omit<Document, 'id'>): Promise<string | null> { // Assuming Document type exists
        try {
            const newDocumentRef = ref(this.db, 'Documents/' + Date.now()); // Simple timestamp as key
            await set(newDocumentRef, document);
            console.log("Document added successfully");
            return newDocumentRef.key;
        } catch (error) {
            console.error("Error adding document:", error);
            throw error;
        }
    }

    async updateDocument(documentId: string, updates: Partial<Document>): Promise<void> { // Assuming Document type exists
        try {
            const documentRef = ref(this.db, `Documents/${documentId}`);
            await update(documentRef, updates);
            console.log(`Document ${documentId} updated successfully`);
        } catch (error) {
            console.error(`Error updating document ${documentId}:`, error);
            throw error;
        }
    }
    
    async deleteDocument(documentId: string): Promise<void> { // Assuming Document type exists
        try {
            const documentRef = ref(this.db, `Documents/${documentId}`);
            await remove(documentRef);
            console.log(`Document ${documentId} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting document ${documentId}:`, error);
            throw error;
        }
    }

    // --- Note Functions ---

    async getNotes(): Promise<Note[]> { // Assuming Note type exists
        try {
            const notesRef = ref(this.db, 'Notes');
            const snapshot = await get(notesRef);
            if (snapshot.exists()) {
                const notesData = snapshot.val();
                return Object.keys(notesData).map(key => ({
                    id: key,
                    ...notesData[key]
                })) as Note[];
            } else {
                console.log("No notes available");
                return [];
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            throw error;
        }
    }

    async addNote(note: Omit<Note, 'id'>): Promise<string | null> { // Assuming Note type exists
        try {
            const newNoteRef = ref(this.db, 'Notes/' + Date.now()); // Simple timestamp as key
            await set(newNoteRef, note);
            console.log("Note added successfully");
            return newNoteRef.key;
        } catch (error) {
            console.error("Error adding note:", error);
            throw error;
        }
    }

    async updateNote(noteId: string, updates: Partial<Note>): Promise<void> { // Assuming Note type exists
        try {
            const noteRef = ref(this.db, `Notes/${noteId}`);
            await update(noteRef, updates);
            console.log(`Note ${noteId} updated successfully`);
        } catch (error) {
            console.error(`Error updating note ${noteId}:`, error);
            throw error;
        }
    }

    async deleteNote(noteId: string): Promise<void> { // Assuming Note type exists
        try {
            const noteRef = ref(this.db, `Notes/${noteId}`);
            await remove(noteRef);
            console.log(`Note ${noteId} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting note ${noteId}:`, error);
            throw error;
        }
    }
}

export const databaseService = new DatabaseService();