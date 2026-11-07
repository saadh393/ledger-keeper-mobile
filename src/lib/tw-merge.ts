import { extendTailwindMerge } from 'tailwind-merge';

export const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['headline', 'title', 'hero', 'body-l', 'body', 'row-title', 'label', 'meta'],
    },
  },
});
