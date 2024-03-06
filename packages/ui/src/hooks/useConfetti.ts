import confetti from 'canvas-confetti';
export type ConfettiOptions = Parameters<typeof confetti>[0];

function useConfetti(props: ConfettiOptions = {}) {
  const triggerConfetti = (args: ConfettiOptions = {}) => {
    confetti({
      particleCount: 450,
      startVelocity: 70,
      spread: 150,
      origin: { y: 0.5, x: 0.5 },
      ...props,
      ...args,
    });
  };
  return triggerConfetti;
}

export default useConfetti;
