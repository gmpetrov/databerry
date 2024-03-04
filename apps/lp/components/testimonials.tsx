'use client';
import Testimonial from '@/components/testimonial';
import TestimonialImg01 from '@/public/images/testimonial-01.jpg';
import TestimonialImg02 from '@/public/images/testimonial-02.jpg';
import TestimonialImg03 from '@/public/images/testimonial-03.jpg';
import TestimonialImg04 from '@/public/images/testimonial-04.jpg';
import TestimonialImg05 from '@/public/images/testimonial-05.jpg';
import TestimonialImg06 from '@/public/images/testimonial-06.jpg';
import TestimonialImg07 from '@/public/images/testimonial-07.jpg';
import TestimonialImg08 from '@/public/images/testimonial-08.jpg';

export default function Testimonials() {
  const testimonials01 = [
    {
      image: TestimonialImg01,
      name: 'Alex Wang',
      user: '@alexwang2911',
      link: 'https://www.linkedin.com/posts/alexwang2911_opensource-technology-gpt-activity-7160572862922133504-XkTJ/',
      content:
        'The auto-sync feature is incredible. Our chatbot always stays updated with our latest data, offering real-time, accurate support.',
    },
    {
      image: TestimonialImg02,
      name: 'François Bossière',
      user: '@francois-bossiere',
      link: 'https://www.linkedin.com/posts/francois-bossiere_gpt-ai-opensource-activity-7161016771695509508-qBJt',
      content:
        'The multilingual support of Chaindesk.ai is outstanding. It has allowed us to expand our services globally, communicating effectively with customers in their native language.',
    },
    {
      image: TestimonialImg03,
      name: 'Jeremie Koskas',
      user: '@koskas-jérémie-b7757b93',
      link: 'https://www.linkedin.com/in/koskas-j%C3%A9r%C3%A9mie-b7757b93',
      content: `Creating a custom chatbot was a breeze, and it's been fantastic for our customer support.`,
    },
    {
      image: TestimonialImg04,
      name: 'Morgan Perry',
      user: '@morgan-perry-2a9b0649',
      link: 'https://www.linkedin.com/in/morgan-perry-2a9b0649',
      content:
        'Chaindesk is a game-changer for us. We could deploy a personalized chatbot without any IT help!',
    },
  ];

  const testimonials02 = [
    {
      image: TestimonialImg05,
      name: 'David Ouaknine',
      user: '@do19',
      link: 'https://www.linkedin.com/in/do19/',
      content:
        'Adding a custom AI Agent on our website was incredibly easy. The chatbot has significantly improved our customer engagement and support availability.',
    },
    ...testimonials01,
    // {
    //   image: TestimonialImg06,
    //   name: 'Karl Ahmed',
    //   user: '@karl87',
    //   link: '#0',
    //   content:
    //     'Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.',
    // },
    // {
    //   image: TestimonialImg07,
    //   name: 'Carlotta Grech',
    //   user: '@carlagrech',
    //   link: '#0',
    //   content:
    //     'Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.',
    // },
    // {
    //   image: TestimonialImg08,
    //   name: 'Alejandra Gok',
    //   user: '@alejandraIT',
    //   link: '#0',
    //   content:
    //     'Extremely thoughtful approaches to business. I highly recommend this product to anyone wanting to jump into something new.',
    // },
  ];

  return (
    <section className="bg-zinc-800">
      <div className="py-12 md:py-20">
        <div className="px-4 mx-auto max-w-6xl sm:px-6">
          <div className="pb-12 mx-auto max-w-3xl text-center md:pb-20">
            <h2 className="text-3xl font-bold font-bricolage-grotesque md:text-4xl text-zinc-200">
              Loved by thousands of businesses from around the world
            </h2>
          </div>
        </div>
        <div className="max-w-[94rem] mx-auto space-y-6">
          {/* Row #1 */}
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_28%,_black_calc(100%-28%),transparent_100%)] group">
            <div className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll group-hover:[animation-play-state:paused]">
              {/* Items */}
              {testimonials01.map((testimonial, index) => (
                <Testimonial key={index} testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll group-hover:[animation-play-state:paused]"
              aria-hidden="true"
            >
              {/* Items */}
              {testimonials01.map((testimonial, index) => (
                <Testimonial key={index} testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
          </div>
          {/* Row #2 */}
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_28%,_black_calc(100%-28%),transparent_100%)] group">
            <div className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll-inverse group-hover:[animation-play-state:paused] [animation-delay:-7.5s]">
              {/* Items */}
              {testimonials02.map((testimonial, index) => (
                <Testimonial key={index} testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex items-start justify-center md:justify-start [&>div]:mx-3 animate-infinite-scroll-inverse group-hover:[animation-play-state:paused] [animation-delay:-7.5s]"
              aria-hidden="true"
            >
              {/* Items */}
              {testimonials02.map((testimonial, index) => (
                <Testimonial key={index} testimonial={testimonial}>
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
