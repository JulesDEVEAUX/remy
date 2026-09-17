import { Wordmark } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-cream p-8">
      <h1>
        <Wordmark size={32} />
      </h1>
      <p className="font-sans text-[15px] text-clay-700">Assistant courses & recettes</p>
    </main>
  );
}
