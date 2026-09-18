'use client';

import { pickRandomEmoji } from '@/lib/emoji';
import { TextField } from './FormField';
import { Icon } from './Icon';
import { IconButton } from './Button';

/**
 * Champ de saisie d'un emoji unique (produit, recette — cf. issue #73) : texte
 * libre (clavier emoji natif du téléphone) plus un bouton pour en tirer un au
 * hasard dans le pool de lib/emoji.ts.
 */
export function EmojiField({
  label = 'Emoji',
  name,
  value,
  onChange,
  error,
}: {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <TextField
          label={label}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={8}
          className="text-center text-[24px]"
          error={error}
        />
      </div>
      <IconButton type="button" aria-label="Choisir un emoji au hasard" onClick={() => onChange(pickRandomEmoji())}>
        <Icon name="Dices" size={18} />
      </IconButton>
    </div>
  );
}