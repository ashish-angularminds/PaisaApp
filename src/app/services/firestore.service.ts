import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, updateDoc, doc, deleteDoc, query, where, setDoc, getDoc } from '@angular/fire/firestore';
import { initalUserStateInterface } from '../store/type/InitialUserState.interface';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  private userCollection = collection(this.firestore, 'UsersData');

  async addDoc(data: initalUserStateInterface, id: string) {
    return await setDoc(doc(this.userCollection, id), data);
    // return await addDoc(this.userCollection, data);
  }

  async updateDoc(id: string, data: initalUserStateInterface) {
    return await updateDoc(doc(this.userCollection, id), { ...data });
  }

  async deleteDoc(id: string) {
    return await deleteDoc(doc(this.userCollection, id));
  }

  async searchDoc(id: string) {
    return await query(this.userCollection, where('Uid', '==', id));
  }

  async getDoc(id: string) {
    return getDoc(doc(this.userCollection, id));
  }
}
