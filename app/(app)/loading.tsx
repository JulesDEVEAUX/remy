import { Icon } from '@/components/ui';

/**
 * Affiché instantanément à la navigation, pendant que le Server Component de
 * la nouvelle page résout ses données — sans ça, l'écran reste figé jusqu'à
 * la fin de la requête (perçu comme de la lenteur, cf. issue #35).
 */
export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Icon name="LoaderCircle" size={28} className="animate-spin text-terracotta" />
    </main>
  );
}
