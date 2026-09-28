import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkController } from './health';

afterEach(() => vi.unstubAllGlobals());

describe('controller health contract', () => {
  it('accepts the versioned controller response and forwards cancellation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok', service: 'controller', api_version: 'v1' })));
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;
    await expect(checkController(signal)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/health', { signal, cache: 'no-store' });
  });

  it.each([
    new Response('{}', { status: 503 }),
    new Response('<html>proxy error</html>'),
    new Response('null'),
    new Response(JSON.stringify({ status: 'ok', service: 'other', api_version: 'v1' })),
    new Response(JSON.stringify({ status: 'ok', service: 'controller', api_version: 'v2' })),
  ])('rejects unsuccessful or incompatible responses', async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    await expect(checkController(new AbortController().signal)).rejects.toThrow();
  });

  it('propagates connection failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(checkController(new AbortController().signal)).rejects.toThrow('Failed to fetch');
  });
});
