import MintForm from '../components/MintForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">ViralX</h1>
      <MintForm />
    </main>
  );
}
