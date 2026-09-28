import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import App from './App';

it('does not claim the controller is online before an actual check', () => {
  const html = renderToStaticMarkup(<App />);
  expect(html).toContain('Проверяем соединение');
  expect(html).not.toContain('Controller доступен');
  expect(html).toContain('role="status"');
});
