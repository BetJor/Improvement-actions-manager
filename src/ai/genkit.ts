import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
    // The Firebase plugin is temporarily removed to resolve a persistent initialization error.
    // The app continues to use the standard Firebase SDK for database operations.
  ],
  model: 'googleai/gemini-2.0-flash',
});
