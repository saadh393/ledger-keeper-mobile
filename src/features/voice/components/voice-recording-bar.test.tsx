import * as React from 'react';
import { VoiceRecordingBar } from '@/features/voice/components/voice-recording-bar';
import { fireEvent, render, screen } from '@/lib/test-utils';

const base = { elapsedSeconds: 12, maxSeconds: 120, hitLimit: false, level: 0.5, credits: 3, canSend: true, onDiscard: jest.fn(), onSend: jest.fn() };

describe('voiceRecordingBar', () => {
  it('shows the timer against the limit and the credit estimate', () => {
    render(<VoiceRecordingBar {...base} />);
    expect(screen.getByTestId('voice-timer')).toHaveTextContent('0:12 / 2:00');
    expect(screen.getByTestId('voice-credits')).toHaveTextContent('≈3 credits');
  });

  it('shows the time limit message when the limit is hit', () => {
    render(<VoiceRecordingBar {...base} elapsedSeconds={120} hitLimit />);
    expect(screen.getByTestId('voice-timer')).toHaveTextContent('Time limit reached');
  });

  it('discards and sends', () => {
    render(<VoiceRecordingBar {...base} />);
    fireEvent.press(screen.getByTestId('voice-discard'));
    fireEvent.press(screen.getByTestId('voice-send'));
    expect(base.onDiscard).toHaveBeenCalled();
    expect(base.onSend).toHaveBeenCalled();
  });

  it('hides the estimate when there is none', () => {
    render(<VoiceRecordingBar {...base} credits={null} />);
    expect(screen.queryByTestId('voice-credits')).toBeNull();
  });
});
