export function getCooldownSeconds(sentAt: number | null, now: number, cooldownSeconds = 60): number {
  if (sentAt === null)
    return 0;
  return Math.max(0, Math.ceil(cooldownSeconds - (now - sentAt) / 1000));
}
