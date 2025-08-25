
'use server';
/**
 * @fileOverview A flow to fetch data from an internal company service.
 * 
 * This flow acts as a server-side proxy to securely call an intranet endpoint
 * that is not exposed to the public internet.
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

    if (!apiUrl) {
        throw new Error("INTRANET_API_URL environment variable is not set.");
    }

    console.log(`Fetching data from intranet service: ${apiUrl}`);
    
    try {
        const response = await fetch(apiUrl, {
            // If your service needs an auth token, you would add it here.
            // headers: {
            //     'Authorization': `Bearer ${process.env.INTRANET_API_TOKEN}`
            // }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Let's take just a few items for the example
        return data.slice(0, 5);

    } catch (error) {
        console.error("Error calling intranet service:", error);
        // In a real scenario, you might want to return a more user-friendly error.
        throw new Error("Could not connect to the intranet service.");
    }
  }
);
