import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const addTransaction = async (userId, data) => {
    try {
        await addDoc(collection(db, 'transactions'), {
            userId,
            title: data.title,
            amount: Number(data.amount),
            type: data.type, // 'income' or 'expense'
            category: data.category,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding transaction: ", error);
    }
};