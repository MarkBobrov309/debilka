import { useEffect, useState } from 'react';
import { checkController } from './health';

type Status = 'checking' | 'online' | 'unavailable';
const labels: Record<Status, string> = {
  checking: 'Проверяем соединение',
  online: 'Controller доступен',
  unavailable: 'Controller недоступен',
};

export default function App() {
  const [status, setStatus] = useState<Status>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 5000);
    setStatus('checking');
    checkController(controller.signal)
      .then(() => { if (active) setStatus('online'); })
      .catch(() => { if (active) setStatus('unavailable'); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  return (
    <main>
      <header><span className="mark">DS</span><span>DSRAO <small>Control Plane</small></span></header>
      <section className="intro">
        <p className="eyebrow">PHASE 0 / FOUNDATION</p>
        <h1>Одна точка управления.<br />Распределённая инфраструктура.</h1>
        <p className="description">Distributed Secure Remote Access Orchestrator — основа системы управления удалённым доступом к специализированным АС.</p>
      </section>
      <section className="panel" aria-labelledby="health-title">
        <div>
          <p className="eyebrow">СОСТОЯНИЕ СИСТЕМЫ</p>
          <h2 id="health-title">Центральный Controller</h2>
          <p role="status" className={`status ${status}`}><span aria-hidden="true">●</span> {labels[status]}</p>
          <p className="hint">Проверяется доступность процесса. Состояние БД, узлов и туннелей появится на следующих этапах.</p>
        </div>
        <button onClick={() => setAttempt((value) => value + 1)} disabled={status === 'checking'}>Проверить снова</button>
      </section>
      <section className="next" aria-labelledby="next-title">
        <p className="eyebrow">СЛЕДУЮЩИЙ ЭТАП</p>
        <h2 id="next-title">Реестр узлов</h2>
        <p>Хранение узлов в PostgreSQL и REST API. Затем — управление через Dashboard и подключение Agent.</p>
      </section>
      <footer>Control Plane управляет инфраструктурой. Пользовательский трафик передаётся между узлами Data Plane.</footer>
    </main>
  );
}
