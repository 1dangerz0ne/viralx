'use client';
import React, { useState } from 'react';

const MintForm = () => {
  const [thread, setThread] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{tx: string; nft: string, image: string} | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl p-8 bg-white/80 rounded-lg shadow flex flex-col gap-5">
      <textarea
        value={thread}
        onChange={(e) => setThread(e.target.value)}
        placeholder="Paste X (Twitter) thread here..."
        required
        rows={8}
        className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Your Wallet Address (Base Sepolia)"
        required
        pattern="^0x[a-fA-F0-9]{40}$"
        className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white text-lg font-semibold py-3 rounded hover:bg-blue-700 transition flex items-center justify-center"
      >
        {loading ? 'Minting...' : 'Mint NFT + Token ($29 USD)'}
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {success && (
        <div className="space-y-2 text-green-700 bg-green-50 p-4 rounded">
          <div>Meme Token deployed: <a href={`https://sepolia.basescan.org/tx/${success.tx}`} className="underline" target="_blank">View Tx</a></div>
          <div>NFT Minted: <a href={`https://sepolia.basescan.org/token/${success.nft}`} className="underline" target="_blank">View NFT</a></div>
          <div>Generated Art:</div>
          <img src={success.image} alt="Meme Art" className="rounded shadow w-40 h-40 object-cover" />
        </div>
      )}
    </form>
  );
};

export default MintForm;
