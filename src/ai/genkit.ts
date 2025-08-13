import {configureGenkit} from 'genkit';
import {googleAi} from '@genkit-ai/googleai';
import {genkit} from 'genkit';

configureGenkit({
  plugins: [googleAi()],
});

export {genkit as ai};
