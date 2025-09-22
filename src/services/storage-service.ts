
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { ActionUserInfo, ActionAttachment } from '@/lib/types';


export async function uploadFileAndUpdateAction(actionId: string, file: File, user: ActionUserInfo): Promise<void> {
  if (!file) throw new Error("No file provided");

  // 1. Create a storage reference
  const filePath = `actions/${actionId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);

  // 2. Upload the file
  await uploadBytes(storageRef, file);

  // 3. Get the download URL
  const downloadURL = await getDownloadURL(storageRef);

  // 4. Create the attachment object
  const newAttachment: ActionAttachment = {
    id: crypto.randomUUID(),
    fileName: file.name,
    fileUrl: downloadURL,
    uploadedBy: user,
    uploadedAt: new Date().toISOString(),
  };

  // 5. Update the action document in Firestore
  const actionDocRef = doc(db, 'actions', actionId);
  await updateDoc(actionDocRef, {
    attachments: arrayUnion(newAttachment),
  });
}
