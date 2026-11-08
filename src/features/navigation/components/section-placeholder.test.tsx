import * as React from 'react';
import { SectionPlaceholder } from '@/features/navigation/components/section-placeholder';
import { render, screen } from '@/lib/test-utils';

describe('sectionPlaceholder', () => {
  it('renders section title in English', () => {
    render(<SectionPlaceholder title="Loans" />);
    expect(screen.getByTestId('section-placeholder')).toBeOnTheScreen();
    expect(screen.getByTestId('section-placeholder-title')).toHaveTextContent('Loans');
  });

  it('renders section title in Bangla', () => {
    render(<SectionPlaceholder title="ঋণ" />);
    expect(screen.getByTestId('section-placeholder-title')).toHaveTextContent('ঋণ');
  });
});
