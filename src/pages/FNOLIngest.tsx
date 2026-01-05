// Simple page to submit parsed email data to /api/fnol-ingest
import { useState } from 'react';
import { fnolApi, ParsedEmailPayload } from '../lib/api';

export function FNOLIngest() {
  const [form, setForm] = useState<ParsedEmailPayload>({
    subject: '',
    body: '',
    attachments: [],
    sender: '',
    received_at: new Date().toISOString(),
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, attachments: e.target.value.split(',').map(a => a.trim()) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fnolApi.ingestFNOL(form);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error submitting data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Submit Parsed Email Data</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" className="w-full p-2 border rounded" />
        <textarea name="body" value={form.body} onChange={handleChange} placeholder="Body" className="w-full p-2 border rounded" rows={4} />
        <input name="attachments" value={form.attachments.join(',')} onChange={handleAttachmentsChange} placeholder="Attachments (comma separated)" className="w-full p-2 border rounded" />
        <input name="sender" value={form.sender} onChange={handleChange} placeholder="Sender" className="w-full p-2 border rounded" />
        <input name="received_at" type="datetime-local" value={form.received_at.slice(0,16)} onChange={e => setForm({ ...form, received_at: new Date(e.target.value).toISOString() })} className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
