import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// By default, Genkit uses the 'prod' environment, which has a 'warn' logLevel.
// For development, we want to see all logs.
configureGenkit({
  logLevel: 'debug',
  enableTracing: true,
});

export const ai = genkit({
  plugins: [
    googleAI(),
    // The Firebase plugin is temporarily removed to resolve a persistent initialization error.
    // The app continues to use the standard Firebase SDK for database operations.
  ],
  model: 'googleai/gemini-2.0-flash',
});
