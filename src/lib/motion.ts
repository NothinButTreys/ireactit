export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

export function mountVariants(reduced: boolean) {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.15 } },
    };
  }
  return {
    hidden: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: EASE_OUT },
    },
  };
}
