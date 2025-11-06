
'use server';

import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AclEntry {
  role: string;
  members: string[];
}

const ACL_DOC_PATH = 'app_settings/firestore_acl';

export async function getAclEntries(): Promise<AclEntry[]> {
    const docRef = doc(db, ACL_DOC_PATH);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().entries) {
        return docSnap.data().entries as AclEntry[];
    }
    return [];
}

export async function setAclEntries(entries: AclEntry[]): Promise<void> {
    const docRef = doc(db, ACL_DOC_PATH);
    await setDoc(docRef, { entries });
}
