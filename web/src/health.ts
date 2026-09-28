export async function checkController(signal: AbortSignal): Promise<void> {
  const response = await fetch('/api/v1/health', { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: unknown = await response.json();
  if (
    !data || typeof data !== 'object' ||
    !('status' in data) || data.status !== 'ok' ||
    !('service' in data) || data.service !== 'controller' ||
    !('api_version' in data) || data.api_version !== 'v1'
  ) throw new Error('Unexpected health response');
}
