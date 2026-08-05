export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const cardHoverVariants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1.02 },
};

export const imageZoomVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
};

export const REVEAL_TRANSITION = { duration: 0.6, ease: EASE_OUT };
export const CARD_TRANSITION = { duration: 0.3, ease: EASE_OUT };
export const IMAGE_TRANSITION = { duration: 0.4, ease: EASE_OUT };
export const CARD_TAP = { scale: 0.98 };

// #ff4081, as an "r, g, b" triplet for interpolating into rgba()/box-shadow strings in JS.
export const NEON_PINK_RGB = "255, 64, 129";
