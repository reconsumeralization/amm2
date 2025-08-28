'use client';
import { useField } from 'payload/components/forms';

export default function AISuggestionsField({ path }: { path: string }) {
  const { value, setValue } = useField<string>({ path });

  const fetchSuggestions = async () => {
    const res = await fetch('/api/integrations/openai/schedule-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: 'appointments', preferences: { duration: 60 } }),
    });
    const { times } = await res.json();
    setValue(times?.join(', ') || 'No suggestions');
  };

  return (
    <div>
      <label>Suggested Times</label>
      <input type="text" value={value || ''} readOnly />
      <button
        type="button"
        onClick={fetchSuggestions}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        Generate Suggestions
      </button>
    </div>
  );
}