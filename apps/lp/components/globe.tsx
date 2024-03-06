import Image from 'next/image';
import React from 'react';

import PlanetImage from '@/public/images/planet.png';

type Props = {};

function Globe({}: Props) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Halo effect */}
        <svg
          className="absolute inset-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          width="800"
          height="800"
          viewBox="0 0 800 800"
          style={{ maxWidth: '200%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="text-gray-400 opacity-75 fill-current">
            <circle className="pulse" cx="400" cy="400" r="200" />
            <circle className="pulse pulse-1" cx="400" cy="400" r="200" />
            <circle className="pulse pulse-2" cx="400" cy="400" r="200" />
          </g>
        </svg>
        {/* Globe image */}
        <Image
          className="relative rounded-full shadow-xl"
          src={PlanetImage}
          width={400}
          alt="Planet"
        />
        {/* Static dots */}
        <svg
          className="absolute top-0 w-full h-auto"
          viewBox="0 0 400 400"
          style={{ left: '12%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter
              x="-41.7%"
              y="-34.2%"
              width="183.3%"
              height="185.6%"
              filterUnits="objectBoundingBox"
              id="world-ill-a"
            >
              <feOffset dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
              <feGaussianBlur
                stdDeviation="6"
                in="shadowOffsetOuter1"
                result="shadowBlurOuter1"
              />
              <feColorMatrix
                values="0 0 0 0 0 0 0 0 0 0.439215686 0 0 0 0 0.956862745 0 0 0 0.32 0"
                in="shadowBlurOuter1"
              />
            </filter>
            <filter
              x="-83.3%"
              y="-68.5%"
              width="266.7%"
              height="271.2%"
              filterUnits="objectBoundingBox"
              id="world-ill-c"
            >
              <feOffset dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
              <feGaussianBlur
                stdDeviation="6"
                in="shadowOffsetOuter1"
                result="shadowBlurOuter1"
              />
              <feColorMatrix
                values="0 0 0 0 0 0 0 0 0 0.439215686 0 0 0 0 0.956862745 0 0 0 0.32 0"
                in="shadowBlurOuter1"
              />
            </filter>
            <filter
              x="-7.3%"
              y="-23.8%"
              width="114.5%"
              height="147.6%"
              filterUnits="objectBoundingBox"
              id="world-ill-e"
            >
              <feGaussianBlur stdDeviation="2" in="SourceGraphic" />
            </filter>
            <ellipse
              id="world-ill-b"
              cx="51"
              cy="175.402"
              rx="24"
              ry="23.364"
            />
            <ellipse
              id="world-ill-d"
              cx="246"
              cy="256.201"
              rx="12"
              ry="11.682"
            />
            <linearGradient
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              id="world-ill-f"
            >
              <stop stopColor="#0070F4" stopOpacity="0" offset="0%" />
              <stop stopColor="#0070F4" stopOpacity=".64" offset="52.449%" />
              <stop stopColor="#0070F4" stopOpacity="0" offset="100%" />
            </linearGradient>
          </defs>
          <g transform="translate(0 -.818)" fill="none" fillRule="evenodd">
            <use
              fill="#000"
              filter="url(#world-ill-a)"
              xlinkHref="#world-ill-b"
            />
            <use fill="#0070F4" xlinkHref="#world-ill-b" />
            <use
              fill="#000"
              filter="url(#world-ill-c)"
              xlinkHref="#world-ill-d"
            />
            <use fill="#0070F4" xlinkHref="#world-ill-d" />
            <ellipse
              fillOpacity=".32"
              fill="#0070F4"
              cx="293"
              cy="142.303"
              rx="8"
              ry="7.788"
            />
            <ellipse
              fillOpacity=".64"
              fill="#0070F4"
              cx="250"
              cy="187.083"
              rx="6"
              ry="5.841"
            />
            <ellipse
              fillOpacity=".64"
              fill="#0070F4"
              cx="13"
              cy="233.811"
              rx="2"
              ry="1.947"
            />
            <ellipse fill="#0070F4" cx="29" cy="114.072" rx="2" ry="1.947" />
            <path
              d="M258 256.2l87-29.204"
              stroke="#666"
              strokeWidth="2"
              opacity=".16"
              filter="url(#world-ill-e)"
            />
            <path
              d="M258 251.333c111.333-40.237 141-75.282 89-105.136M136 103.364c66.667 4.543 104.667 32.45 114 83.72"
              stroke="url(#world-ill-f)"
              strokeWidth="2"
              strokeDasharray="2"
            />
          </g>
        </svg>
        {/* Dynamic dots */}
        <feGaussianBlur
          className="absolute max-w-full"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{ width: '12%', top: '45%', left: '50%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="text-blue-600 fill-current">
            <circle
              className="pulse pulse-mini pulse-1"
              cx="24"
              cy="24"
              r="8"
            />
            <circle
              className="pulse pulse-mini pulse-2"
              cx="24"
              cy="24"
              r="8"
            />
            <circle cx="24" cy="24" r="8" />
          </g>
        </feGaussianBlur>
        <svg
          className="absolute max-w-full"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{ width: '12%', top: '19%', left: '46%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="text-blue-600 fill-current">
            <circle className="pulse pulse-mini" cx="24" cy="24" r="8" />
            <circle
              className="pulse pulse-mini pulse-2"
              cx="24"
              cy="24"
              r="8"
            />
            <circle cx="24" cy="24" r="8" />
          </g>
        </svg>
        {/* Avatars */}
        {/* <Image
        className="absolute max-w-full transform animate-float"
        src={PlanetAvatar01}
        width={261}
        height={105}
        alt="Planet avatar 01"
        style={{ width: '65.25%', top: '-3%', right: '-27%' }}
      />
      <Image
        className="absolute max-w-full transform animate-float animation-delay-1000"
        src={PlanetAvatar02}
        width={355}
        height={173}
        alt="Planet avatar 02"
        style={{ width: '88.7%', bottom: '-20%', right: '-18%' }}
      /> */}
        {/* Black icon */}
        <svg
          className="absolute top-0 w-20 max-w-full h-auto rounded-full shadow-xl"
          viewBox="0 0 80 80"
          style={{ width: '20%', left: '6%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="text-gray-800 fill-current"
            cx="40"
            cy="40"
            r="40"
          />
          <path
            className="text-white stroke-current"
            d="M30.19 41.221c7.074 3.299 12.957-4.7 20.03-1.401l1.769.824-1.419-3.883M43.988 50.877l3.887-1.41-1.769-.824c-2.19-1.021-3.475-2.651-4.42-4.512M38.724 36.91c-.944-1.86-2.23-3.49-4.42-4.512"
            strokeLinecap="square"
            strokeWidth="2"
          />
        </svg>
        {/* Blue icon */}
        <svg
          className="absolute w-16 max-w-full h-auto rounded-full shadow-xl"
          viewBox="0 0 64 64"
          style={{ width: '16%', top: '32%', left: '-27%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="text-blue-600 fill-current"
            cx="32"
            cy="32"
            r="32"
          />
          <path
            className="text-white stroke-current"
            d="M20.733 31.416l18.127-8.452M43.039 31.926L24.913 40.38"
            strokeWidth="2"
            fill="none"
          />
          <path
            className="text-white stroke-current"
            strokeLinecap="square"
            d="M32.238 20.595l6.622 2.369-2.442 6.594M31.534 42.747l-6.621-2.368 2.442-6.595"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        {/* White icon */}
        <svg
          className="absolute w-16 max-w-full h-auto rounded-full shadow-xl"
          viewBox="0 0 64 64"
          style={{ width: '16%', top: '55%', right: '-16%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="text-gray-100 fill-current"
            fill="#FBFBFB"
            cx="32"
            cy="32"
            r="32"
          />
          <path
            className="text-gray-700 fill-current"
            d="M37.11 32.44l-1.69 4.646-8.458-3.078.676-1.859-4.773 1.42 2.744 4.156.677-1.858 9.396 3.42a.994.994 0 001.278-.587l2.03-5.576-1.88-.684zM27.037 30.878l1.691-4.646 8.457 3.078-.676 1.858 4.773-1.42-2.744-4.155-.676 1.858-9.397-3.42a.994.994 0 00-1.278.587l-2.03 5.576 1.88.684z"
          />
        </svg>
      </div>
    </div>
  );
}

export default Globe;
