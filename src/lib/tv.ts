import { createTV } from 'tailwind-variants';

export const tv = createTV({
  twMergeConfig: {
    extend: {
      theme: {
        text: [
          'headline',
          'title',
          'hero',
          'body-l',
          'body',
          'row-title',
          'label',
          'meta',
        ],
        color: [
          'paper-100',
          'paper-200',
          'surface',
          'surface-container',
          'border',
          'border-strong',
          'ink-900',
          'ink-700',
          'ink-500',
          'accent',
          'on-accent',
          'link',
          'selected',
          'on-selected',
          'forest-500',
          'forest-100',
          'clay-500',
          'clay-100',
          'wheat-500',
          'wheat-200',
          'brand-blue',
          'brand-green',
          'brand-yellow',
          'brand-red',
        ],
      },
    },
  },
});
