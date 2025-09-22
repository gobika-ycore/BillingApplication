// Firebase Service - Main service file for Firebase operations
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

class FirebaseService {
  constructor() {
    this.auth = auth();
    this.firestore = firestore();
    this.storage = storage();
  }

  // Authentication Methods
  async signUp(email, password) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Firestore Methods
  async addDocument(collection, data) {
    try {
      const docRef = await this.firestore.collection(collection).add({
        ...data,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateDocument(collection, docId, data) {
    try {
      await this.firestore.collection(collection).doc(docId).update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(collection, docId) {
    try {
      await this.firestore.collection(collection).doc(docId).delete();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getDocument(collection, docId) {
    try {
      const doc = await this.firestore.collection(collection).doc(docId).get();
      if (doc.exists) {
        return { success: true, data: { id: doc.id, ...doc.data() } };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCollection(collection, orderBy = 'createdAt', orderDirection = 'desc') {
    try {
      const snapshot = await this.firestore
        .collection(collection)
        .orderBy(orderBy, orderDirection)
        .get();
      
      const documents = [];
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: documents };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Real-time listener for collection
  subscribeToCollection(collection, callback, orderBy = 'createdAt', orderDirection = 'desc') {
    return this.firestore
      .collection(collection)
      .orderBy(orderBy, orderDirection)
      .onSnapshot(
        (snapshot) => {
          const documents = [];
          snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
          });
          callback({ success: true, data: documents });
        },
        (error) => {
          callback({ success: false, error: error.message });
        }
      );
  }

  // Storage Methods
  async uploadFile(filePath, fileName, folder = 'uploads') {
    try {
      const reference = this.storage.ref(`${folder}/${fileName}`);
      await reference.putFile(filePath);
      const downloadURL = await reference.getDownloadURL();
      return { success: true, downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFile(fileName, folder = 'uploads') {
    try {
      const reference = this.storage.ref(`${folder}/${fileName}`);
      await reference.delete();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new FirebaseService();
