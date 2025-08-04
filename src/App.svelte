<script>
  import AudioAligner from './routes/AudioAligner.svelte';
</script>

<main class="min-h-screen bg-gray-50" style="background-color: #f9fafb; padding: 2rem;">
  <div class="container mx-auto px-4 py-8" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
    <h1 class="text-3xl font-bold text-gray-900 mb-8" style="font-size: 1.875rem; font-weight: bold; color: #111827; margin-bottom: 2rem;">Audio Aligner</h1>
    <AudioAligner />
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f9fafb;
  }
  
  :global(*) {
    box-sizing: border-box;
  }
</style> 