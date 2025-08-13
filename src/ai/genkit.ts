import {configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkit} from 'genkit';

configureGenkit({
  plugins: [googleAI()],
});

export {genkit as ai};
