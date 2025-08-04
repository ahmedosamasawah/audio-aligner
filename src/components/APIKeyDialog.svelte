<script>
  import { apiKey } from '~/stores/apiKey.js';
  
  export let open = false;
  
  let inputValue = $apiKey || '';
  
  function handleSubmit() {
    $apiKey = inputValue;
    open = false;
  }
  
  function handleCancel() {
    inputValue = $apiKey || '';
    open = false;
  }
</script>

{#if open}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h2 class="text-lg font-semibold mb-4">Set API Key</h2>
      
      <div class="mb-4">
        <label for="api-key" class="block text-sm font-medium text-gray-700 mb-2">
          API Key
        </label>
        <input
          id="api-key"
          type="password"
          bind:value={inputValue}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your API key"
        />
      </div>
      
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          on:click={handleCancel}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          on:click={handleSubmit}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
{/if} 