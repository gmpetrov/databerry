import Image, { StaticImageData } from 'next/image';

interface TestimonialProps {
  testimonial: {
    image: StaticImageData;
    name: string;
    user: string;
    link: string;
    content: string;
  };
  children: React.ReactNode;
}

export default function Testimonial({
  testimonial,
  children,
}: TestimonialProps) {
  return (
    <div className="rounded h-full w-[22rem] border border-transparent [background:linear-gradient(#323237,#323237)_padding-box,linear-gradient(120deg,theme(colors.zinc.700),theme(colors.zinc.700/0),theme(colors.zinc.700))_border-box] p-5">
      <div className="flex items-center mb-4">
        <Image
          className="shrink-0 rounded-full mr-3"
          src={testimonial.image}
          width={44}
          height={44}
          alt={testimonial.name}
        />
        <div>
          <div className="font-bricolage-grotesque font-bold text-zinc-200">
            {testimonial.name}
          </div>
          <div>
            <a
              className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition"
              href={testimonial.link}
            >
              {testimonial.user}
            </a>
          </div>
        </div>
      </div>
      <div className="text-zinc-500 before:content-['\0022'] after:content-['\0022']">
        {children}
      </div>
    </div>
  );
}
