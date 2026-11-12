const minHoldMs = 1000;

export function getHoldRelease(heldMs: number): 'cancel' | 'send' {
  return heldMs < minHoldMs ? 'cancel' : 'send';
}
