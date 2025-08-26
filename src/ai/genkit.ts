import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Configure Genkit with plugins and options.
// In Genkit v1.x, configuration options like logLevel are passed directly to the genkit() constructor.
configureGenkit({
  plugins: [
    googleAI(),
    // The Firebase plugin is temporarily removed to resolve a persistent initialization error.
    // The app continues to use the standard Firebase SDK for database operations.
  ],
  logLevel: 'debug', // Set to 'debug' to see all logs for development
  enableTracing: true,
});

// Export the configured Genkit instance.
export const ai = genkit({
  model: 'googleai/gemini-2.0-flash',
});
