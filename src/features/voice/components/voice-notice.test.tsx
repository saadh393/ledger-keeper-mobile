import * as React from 'react';
import { VoiceNotice } from '@/features/voice/components/voice-notice';
import { render, screen } from '@/lib/test-utils';

describe('voiceNotice', () => {
  it('shows the full permission message without Open settings after a first denial', () => {
    render(<VoiceNotice reason="permission-denied" />);
    expect(screen.getByTestId('voice-notice-text')).toHaveTextContent('Microphone access is needed to record');
    expect(screen.getByTestId('voice-notice-text').props.numberOfLines).toBeUndefined();
    expect(screen.queryByTestId('voice-open-settings')).toBeNull();
  });

  it('offers Open settings when access is blocked', () => {
    render(<VoiceNotice reason="permission-blocked" />);
    expect(screen.getByTestId('voice-open-settings')).toBeOnTheScreen();
  });
});
