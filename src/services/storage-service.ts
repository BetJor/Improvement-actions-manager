
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { ActionUserInfo, ActionAttachment } from '@/lib/types';


export async function uploadFileAndUpdateAction(actionId: string, file: File, user: ActionUserInfo): Promise<void> {
  console.log("[Storage Service] Starting upload for action:", actionId, "by user:", user);
  if (!file) {
    console.error("[Storage Service] No file provided.");
    throw new Error("No file provided");
  }
  if (!user || !user.id || !user.name) {
      console.error("[Storage Service] Invalid user object provided:", user);
      throw new Error("Invalid user object for upload.");
  }


  // 1. Create a storage reference
  const filePath = `actions/${actionId}/${Date.now()}-${file.name}`;
  console.log("[Storage Service] File path:", filePath);
  const storageRef = ref(storage, filePath);

  // 2. Define metadata for the upload, including the user's ID for security rules
  const metadata = {
    customMetadata: {
      'userId': user.id
    }
  };

  // 3. Upload the file with metadata
  console.log("[Storage Service] Uploading bytes with metadata...", metadata);
  await uploadBytes(storageRef, file, metadata);
  console.log("[Storage Service] Upload successful.");


  // 4. Get the download URL
  console.log("[Storage Service] Getting download URL...");
  const downloadURL = await getDownloadURL(storageRef);
  console.log("[Storage Service] Download URL:", downloadURL);


  // 5. Create the attachment object
  const newAttachment: ActionAttachment = {
    id: crypto.randomUUID(),
    fileName: file.name,
    fileUrl: downloadURL,
    uploadedBy: user,
    uploadedAt: new Date().toISOString(),
  };
  console.log("[Storage Service] New attachment object created:", newAttachment);


  // 6. Update the action document in Firestore
  const actionDocRef = doc(db, 'actions', actionId);
  console.log("[Storage Service] Updating Firestore document...");
  await updateDoc(actionDocRef, {
    attachments: arrayUnion(newAttachment),
  });
  console.log("[Storage Service] Firestore document updated successfully.");
}
