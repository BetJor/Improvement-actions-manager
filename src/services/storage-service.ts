

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import type { ActionUserInfo, ActionAttachment } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


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

  const filePath = `actions/${actionId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  const metadata = { customMetadata: { 'userId': user.id } };

  try {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`[Storage Service] Upload is ${progress.toFixed(2)}% done`);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const uploaderInfo: ActionUserInfo = { id: user.id, name: user.name, avatar: user.avatar || "" };
            const newAttachment: ActionAttachment = {
              id: crypto.randomUUID(),
              fileName: file.name,
              description: description || '',
              fileUrl: downloadURL,
              uploadedBy: uploaderInfo,
              uploadedAt: new Date().toISOString(),
            };
            
            const actionDocRef = doc(db, 'actions', actionId);
            
            updateDoc(actionDocRef, { attachments: arrayUnion(newAttachment) })
              .then(resolve)
              .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: actionDocRef.path,
                    operation: 'update',
                    requestResourceData: { attachments: 'add new' },
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
                reject(serverError); // Also reject the promise
              });
          } catch (innerError) {
            reject(innerError);
          }
        }
      );
    });

  } catch (error) {
    console.error("[Storage Service] Fatal error in uploadFileAndUpdateAction:", error);
    // Here we can't create a FirestorePermissionError as it might not be a permissions issue.
    // The error is re-thrown to be handled by the calling component's try/catch block.
    throw error;
  }
}

