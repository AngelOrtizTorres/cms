'use client';

import { FormEvent, useState } from 'react';
import { sendContactMessage } from '@/lib/services/config';

export default function ContactPage() {
  const [status, setStatus] = useState<string>('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Enviando...');

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      subject: String(form.get('subject') || ''),
      message: String(form.get('message') || ''),
      phone_number: String(form.get('phone_number') || ''),
      source_url: typeof window !== 'undefined' ? window.location.href : '',
      privacy_accepted: true,
    };

    try {
      await sendContactMessage(payload);
      setStatus('Mensaje enviado correctamente');
      event.currentTarget.reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No fue posible enviar el mensaje';
      setStatus(message);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Contacto</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume POST /contact</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded border p-6">
        <input name="name" required placeholder="Nombre" className="w-full rounded border px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded border px-3 py-2" />
        <input name="phone_number" placeholder="Telefono" className="w-full rounded border px-3 py-2" />
        <input name="subject" required placeholder="Asunto" className="w-full rounded border px-3 py-2" />
        <textarea name="message" required placeholder="Mensaje" className="w-full rounded border px-3 py-2 min-h-32" />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">Enviar</button>
      </form>

      {status ? <p className="mt-4">{status}</p> : null}
    </main>
  );
}
