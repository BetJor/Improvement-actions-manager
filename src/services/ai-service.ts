
import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GalleryPrompt } from '@/lib/types';
import type { AclEntry } from '@/app/firestore-rules/page';

// --- CRUD for AI Prompts ---
type PromptId = "improveWriting" | "analysisSuggestion" | "correctiveActions";

export async function getPrompt(promptId: PromptId): Promise<string> {
    const docRef = doc(db, 'app_settings', 'prompts');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data[promptId]) {
            return data[promptId];
        }
    }

    // Fallback to default prompts if they don't exist in Firestore
    const defaultPrompts = {
        improveWriting: "Eres un experto en sistemas de gestión de calidad (normas ISO 9001). Tu tarea es reescribir las observaciones de una no conformidad o una oportunidad de mejora para hacerlas más claras, profesionales y detalladas. Añade contexto, detalles relevantes y un lenguaje preciso para facilitar su análisis posterior. El texto debe ser conciso y directo, pero sin perder información crucial. Devuelve solo la descripción mejorada, sin ningún texto introductorio ni despedida.",
        analysisSuggestion: "Eres un experto en sistemas de gestión de calidad (ISO 9001). Tu tarea es analizar las observaciones de una acción de mejora y proponer un análisis de causas raíz y un plan de acción correctivo. \n\n1. **Análisis de Causas**: Identifica las posibles causas raíz del problema descrito. Utiliza la técnica de los '5 Porqués' o un análisis causa-efecto si es necesario. El análisis debe ser lógico, estructurado e ir más allá de los síntomas superficiales.\n\n2. **Acciones Correctivas Propuestas**: Basándote en el análisis de causas, propón entre 1 y 3 acciones correctivas específicas, medibles, alcanzables, relevantes y con un plazo definido (SMART). Las acciones deben abordar directamente las causas raíz identificadas.\n\nEl resultado debe ser en formato JSON, siguiendo el esquema definido.",
        correctiveActions: "Eres un experto en la creación de planes de acción para sistemas de gestión de calidad. Tu tarea es, basándote en una descripción de un problema y su análisis de causas, proponer acciones correctivas efectivas. Las acciones deben ser claras, concisas y orientadas a eliminar la causa raíz del problema para evitar su recurrencia. Propón entre 1 y 3 acciones."
    };

    if (defaultPrompts[promptId]) {
        // Optionally, save the default prompt to Firestore for future use
        await updatePrompt(promptId, defaultPrompts[promptId]);
        return defaultPrompts[promptId];
    }
    
    return '';
}


export async function updatePrompt(promptId: PromptId, newPrompt: string): Promise<void> {
    const docRef = doc(db, 'app_settings', 'prompts');
    await setDoc(docRef, { [promptId]: newPrompt }, { merge: true });
}

// --- CRUD for Prompt Gallery ---
export async function getGalleryPrompts(): Promise<GalleryPrompt[]> {
    const promptsCol = collection(db, 'prompt_gallery');
    const snapshot = await getDocs(query(promptsCol, orderBy("title")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryPrompt));
}

export async function addGalleryPrompt(prompt: Omit<GalleryPrompt, 'id'>): Promise<string> {
    const collectionRef = collection(db, 'prompt_gallery');
    const docRef = await addDoc(collectionRef, prompt);
    return docRef.id;
}

export async function updateGalleryPrompt(promptId: string, prompt: Omit<GalleryPrompt, 'id'>): Promise<void> {
    const docRef = doc(db, 'prompt_gallery', promptId);
    await updateDoc(docRef, prompt);
}

export async function deleteGalleryPrompt(promptId: string): Promise<void> {
    const docRef = doc(db, 'prompt_gallery', promptId);
    await deleteDoc(docRef);
}

// --- Firestore Rules ACL Management ---

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

    

    