export function parse_api_keys_from_url() {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  const apiKeys = {};
  
  // Parse API keys from URL parameters
  for (const [key, value] of urlParams.entries()) {
    if (key.includes('api_key') || key.includes('apikey')) {
      const service = key.replace('_api_key', '').replace('_apikey', '');
      apiKeys[service] = value;
    }
  }
  
  return apiKeys;
} 