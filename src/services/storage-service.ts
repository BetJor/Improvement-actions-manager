

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import type { ActionUserInfo, ActionAttachment } from '@/lib/types';


export async function uploadFileAndUpdateAction(actionId: string, file: File, user: ActionUserInfo, description?: string): Promise<void> {
  console.log("--- [Storage Service] Starting upload process ---");
  if (!file) {
    console.error("[Storage Service] Error: No file provided.");
    throw new Error("No file provided");
  }
  if (!user || !user.id || !user.name) {
      console.error("[Storage Service] Error: Invalid user object.", user);
      throw new Error("Invalid user object for upload.");
  }

  console.log(`[Storage Service] Action ID: ${actionId}, File: ${file.name}, User: ${user.id}`);

  const filePath = `actions/${actionId}/${Date.now()}-${file.name}`;
  console.log(`[Storage Service] 1. Generated file path: ${filePath}`);
  const storageRef = ref(storage, filePath);

  const metadata = {
    customMetadata: { 'userId': user.id }
  };
  console.log("[Storage Service] 2. Metadata created:", metadata);

  try {
    console.log("[Storage Service] 3. Preparing resumable upload...");
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`[Storage Service] Upload is ${progress.toFixed(2)}% done`);
        },
        (error) => {
          console.error('[Storage Service] --- ERROR during file upload ---', error);
          reject(error);
        },
        async () => {
          try {
            console.log("[Storage Service] 4. File uploaded successfully.");
            
            console.log("[Storage Service] 5. Getting download URL...");
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`[Storage Service] 6. Download URL obtained: ${downloadURL}`);

            // FIX: Create a clean user object for Firestore
            const uploaderInfo: ActionUserInfo = {
              id: user.id,
              name: user.name,
              avatar: user.avatar || "",
            };

            const newAttachment: ActionAttachment = {
              id: crypto.randomUUID(),
              fileName: file.name,
              description: description || '',
              fileUrl: downloadURL,
              uploadedBy: uploaderInfo, // Use the clean object
              uploadedAt: new Date().toISOString(),
            };
            console.log("[Storage Service] 7. New attachment object created:", newAttachment);

            const actionDocRef = doc(db, 'actions', actionId);
            console.log("[Storage Service] 8. Updating Firestore document...");
            await updateDoc(actionDocRef, {
              attachments: arrayUnion(newAttachment),
            });
            console.log("[Storage Service] 9. Firestore document updated successfully.");
            resolve();
          } catch (innerError) {
            console.error('[Storage Service] --- ERROR after upload (getting URL or updating doc) ---', innerError);
            reject(innerError);
          }
        }
      );
    });

  } catch (error) {
    console.error("[Storage Service] --- FATAL ERROR in uploadFileAndUpdateAction ---", error);
    throw error;
  }
}

