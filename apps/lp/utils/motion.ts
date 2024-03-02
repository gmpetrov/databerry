import { Variant, Variants } from 'framer-motion';

export const makeVariants = (props?: {
  hidden?: Variant;
  visible?: Variant;
}) => {
  return {
    hidden: {
      ...props?.hidden,
    },
    visible: {
      ...props?.visible,
      transition: {
        staggerChildren: 0.5,
        ...(props?.visible as any)?.transition,
      },
    },
  } as Variants;
};

export const defaultContainerVariants = makeVariants({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.5,
    },
  },
});

export const defaultChildVariants = makeVariants({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
});
