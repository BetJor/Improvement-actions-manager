
'use server';
/**
 * @fileOverview A flow to fetch data from an internal company service via Gravitee.
 * 
 * This flow acts as a server-side proxy to securely call a Gravitee API endpoint
 * that is protected by an API key.
 * 
 * - getIntranetData - The main function to call to get data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the expected output schema from the intranet service.
// For this example, we expect an array of objects with a 'title' property.
const IntranetDataSchema = z.array(z.object({
    id: z.number(),
    title: z.string(),
    userId: z.number(),
    completed: z.boolean(),
}));
export type IntranetData = z.infer<typeof IntranetDataSchema>;

// This is the main function that the frontend will call.
export async function getIntranetData(): Promise<IntranetData> {
  return getIntranetDataFlow();
}

const getIntranetDataFlow = ai.defineFlow(
  {
    name: 'getIntranetDataFlow',
    inputSchema: z.void(),
    outputSchema: IntranetDataSchema,
  },
  async () => {
    const apiUrl = process.env.INTRANET_API_URL;
    const apiKey = process.env.GRAVITEE_API_KEY;

    if (!apiUrl) {
        throw new Error("INTRANET_API_URL environment variable is not set.");
    }
    if (!apiKey) {
        throw new Error("GRAVITEE_API_KEY environment variable is not set. Please add your Gravitee API key.");
    }

    console.log(`Fetching data from Gravitee endpoint: ${apiUrl}`);
    
    let response;
    try {
        response = await fetch(apiUrl, {
            headers: {
                // Adjust the Authorization scheme if needed (e.g., 'Bearer' instead of 'ApiKey')
                // This depends on your Gravitee API plan configuration.
                'Authorization': `ApiKey ${apiKey}`
            }
        });
    } catch (networkError: any) {
        console.error("[getIntranetDataFlow] Network Error:", networkError.message);
        throw new Error("Error de xarxa o de connexió en intentar accedir a l'endpoint de Gravitee. Assegura't que el servidor té accés a la URL.");
    }

    if (!response.ok) {
        console.error(`[getIntranetDataFlow] Error response from service: ${response.status} ${response.statusText}`);
        if (response.status === 401 || response.status === 403) {
            throw new Error(`Error d'autenticació (${response.status}). Verifica que la GRAVITEE_API_KEY és correcta i té permisos.`);
        }
        throw new Error(`L'endpoint de Gravitee ha retornat un error: ${response.status} ${response.statusText}`);
    }

    try {
        const data = await response.json();
        // Let's take just a few items for the example
        return data.slice(0, 5);
    } catch (jsonError: any) {
        console.error("[getIntranetDataFlow] JSON Parsing Error:", jsonError.message);
        throw new Error("Error en processar la resposta JSON del servei. Verifica que el format de la resposta és correcte.");
    }
  }
);

