'use client';
import { motion, stagger, useAnimate, Variants } from 'framer-motion';
import React from 'react';

export function TextGenerateEffect(props: {
  text: string | any[];
  duration?: number;
}) {
  const words = React.useMemo(() => {
    return typeof props.text === 'string' ? props.text.split(' ') : props.text;
  }, [props.text]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: (props.duration || 1.5) / words.length, // Stagger the children with a 0.1-second delay between each child
      },
    },
  } as Variants;

  // Define child variants
  const childVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 1, // Duration of the animation for each child
      },
    },
  } as Variants;
  return (
    <motion.span
      variants={containerVariants}
      // initial="hidden"
      // animate="visible"
      className="relative"
    >
      {words.map((el, i) => (
        <motion.span variants={childVariants} key={i}>
          {el}{' '}
        </motion.span>
      ))}
      {/* <span className="relative flex w-8 h-8 mt-[0px]">
        <span className="inline-flex absolute w-full h-full rounded-full opacity-75 animate-ping bg-zinc-400"></span>
        <span className="inline-flex relative w-8 h-8 rounded-full bg-zinc-500"></span>
      </span> */}
      {/* <span className="absolute left-0 -top-1/2 translate-y-1/2"> */}

      {/* </span> */}
    </motion.span>

    // <div className="App">
    //   {props.text.split(' ').map((el, i) => (
    //     <motion.span
    //       initial={{ opacity: 0 }}
    //       animate={{ opacity: 1 }}
    //       transition={{
    //         duration: 0.25,
    //         delay: i / 10,
    //       }}
    //       key={i}
    //     >
    //       {el}{' '}
    //     </motion.span>
    //   ))}
    // </div>
  );
}
