import { getContext } from 'svelte';
import { apiKey } from '~/stores/apiKey.js';

export function use_api_key(type = 'default') {
  if (type === 'utils') {
    return {
      apiKey: apiKey,
      hasApiKey: () => {
        // We can't use $apiKey here since this is not a .svelte file
        // The component using this will need to subscribe to the store
        return true; // This will be handled by the component
      }
    };
  }
  
  return {
    apiKey: apiKey,
    hasApiKey: () => {
      return true; // This will be handled by the component
    }
  };
} 