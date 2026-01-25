// lib/goals.js
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const addGoal = async (userId, goalData) => {
    try {
        await addDoc(collection(db, 'goals'), {
            ...goalData,
            userId,
            createdAt: serverTimestamp(),
            currentSaved: 0 // Initialize at 0
        });
    } catch (err) {
        console.error("Error adding goal:", err);
        throw err;
    }
};