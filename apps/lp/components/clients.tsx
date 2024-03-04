'use client';

// import 'swiper/swiper.min.css';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';
// Import Swiper
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

import Particles from './ui/particles';

// import Particles from './particles';
import Client01 from '@/public/images/client-01.svg';
import Client02 from '@/public/images/client-02.svg';
import Client03 from '@/public/images/client-03.svg';
import Client04 from '@/public/images/client-04.svg';
import Client05 from '@/public/images/client-05.svg';
import Client06 from '@/public/images/client-06.svg';
import Client07 from '@/public/images/client-07.svg';
import Client08 from '@/public/images/client-08.svg';
import Client09 from '@/public/images/client-09.svg';
import { defaultChildVariants, defaultContainerVariants } from '@/utils/motion';
Swiper.use([Autoplay]);

export default function Clients() {
  useEffect(() => {
    const carousel = new Swiper('.clients-carousel', {
      slidesPerView: 'auto',
      spaceBetween: 64,
      centeredSlides: true,
      loop: true,
      speed: 5000,
      noSwiping: true,
      noSwipingClass: 'swiper-slide',
      autoplay: {
        delay: 0,
        disableOnInteraction: true,
      },
    });
  }, []);

  return (
    <section>
      <div className="relative px-4 mx-auto max-w-6xl sm:px-6">
        {/* Particles animation */}
        {/* <div className="absolute inset-0 px-4 mx-auto max-w-6xl sm:px-6"> */}
        {/* <Particles className="absolute inset-0 -z-10" quantity={10} /> */}
        {/* </div> */}

        <motion.div
          // className="py-12 md:py-16"
          className="pb-12 md:pb-16"
          variants={defaultContainerVariants}
          initial="hidden"
          whileInView={'visible'}
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* <motion.h3
            className="mb-8 text-2xl font-semibold text-center font-bricolage-grotesque text-zinc-900"
            variants={childVariants}
          >
            Trusted by the world's most innovative teams
          </motion.h3> */}
          <motion.div
            className="overflow-hidden"
            variants={defaultChildVariants}
          >
            {/* Carousel built with Swiper.js [https://swiperjs.com/] */}
            {/* * Custom styles in src/css/additional-styles/theme.scss */}
            <div className="relative clients-carousel swiper-container before:absolute before:inset-0 before:w-32 before:z-10 before:pointer-events-none after:absolute after:inset-0 after:left-auto after:w-32 after:z-10 after:pointer-events-none before:bg-gradient-to-r before:from-white after:bg-gradient-to-l after:from-white">
              <div className="swiper-wrapper !ease-linear select-none items-center">
                {/* Carousel items */}
                <div className="swiper-slide !w-auto">
                  <Image
                    src={Client01}
                    alt="Client 01"
                    width={110}
                    height={21}
                  />
                </div>
                <div className="swiper-slide !w-auto">
                  <Image
                    src={Client02}
                    alt="Client 02"
                    width={70}
                    height={25}
                  />
                </div>
                <div className="swiper-slide !w-auto">
                  <Image
                    className="mt-1"
                    src={Client03}
                    alt="Client 03"
                    width={107}
                    height={33}
                  />
                </div>
                <div className="swiper-slide !w-auto">
                  <Image
                    src={Client04}
                    alt="Client 04"
                    width={85}
                    height={36}
                  />
                </div>
                <div className="swiper-slide !w-auto">
                  <Image
                    src={Client05}
                    alt="Client 05"
                    width={86}
                    height={18}
                  />
                </div>
                <div className="swiper-slide !w-auto">
                  <Image
                    src={Client06}
                    alt="Client 06"
                    width={78}
                    height={34}
                  />
                </div>
                <div className="swiper-slide !w-auto">
                  <Image
                    src={Client07}
                    alt="Client 07"
                    width={83}
                    height={23}
                  />
                </div>
                <div className="swiper-slide !w-auto">
                  <Image
                    src={Client08}
                    alt="Client 08"
                    width={98}
                    height={26}
                  />
                </div>
                <div className="swiper-slide !w-auto">
                  <Image
                    className="mt-2"
                    src={Client09}
                    alt="Client 09"
                    width={92}
                    height={28}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
