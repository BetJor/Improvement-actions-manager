import {genkit, type GenkitOptions} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// In Genkit v1.x, the configuration is passed directly to the genkit() constructor.
const genkitConfig: GenkitOptions = {
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracing: true,
  model: 'googleai/gemini-2.0-flash',
};

// Export the configured Genkit instance.
export const ai = genkit(genkitConfig);
