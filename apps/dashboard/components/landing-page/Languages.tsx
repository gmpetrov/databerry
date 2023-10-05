import { Stack } from '@mui/joy';
import { shuffle } from 'radash';
import React, { useEffect } from 'react';

type Props = {};

const flags = [
  '🇦🇱',
  '🇦🇲',
  '🇦🇶',
  '🇦🇸',
  '🇦🇺',
  '🇦🇽',
  '🇧🇦',
  '🇧🇩',
  '🇧🇫',
  '🇧🇭',
  '🇧🇯',
  '🇧🇲',
  '🇧🇴',
  '🇧🇸',
  '🇧🇻',
  '🇧🇾',
  '🇨🇦',
  '🇨🇨',
  '🇨🇫',
  '🇨🇮',
  '🇹🇩',
  '🇨🇲',
  '🇨🇴',
  '🇨🇷',
  '🇨🇻',
  '🇨🇽',
  '🇨🇿',
  '🇪🇦',
  '🇰🇭',
  '🇰🇾',
  '🇩🇯',
  '🇩🇲',
  '🇪🇨',
  '🇪🇬',
  '🇪🇷',
  '🇸🇻',
  '🇪🇺',
  '🇫🇯',
  '🇫🇴',
  '🇬🇫',
  '🇹🇫',
  '🇬🇦',
  '🇬🇪',
  '🇬🇭',
  '🇬🇱',
  '🇬🇳',
  '🇬🇶',
  '🇬🇸',
  '🇬🇺',
  '🇬🇾',
  '🇭🇲',
  '🇭🇹',
  '🇸🇭',
  '🇮🇪',
  '🇮🇲',
  '🇮🇴',
  '🇮🇷',
  '🇮🇹',
  '🇯🇲',
  '🇯🇵',
  '🇰🇬',
  '🇰🇳',
  '🇰🇷',
  '🇽🇰',
  '🇱🇦',
  '🇱🇨',
  '🇱🇰',
  '🇱🇸',
  '🇱🇺',
  '🇱🇾',
  '🇲🇦',
  '🇲🇩',
  '🇲🇫',
  '🇲🇭',
  '🇲🇱',
  '🇲🇳',
  '🇲🇵',
  '🇲🇷',
  '🇲🇸',
  '🇲🇺',
  '🇲🇼',
  '🇲🇾',
  '🇳🇦',
  '🇳🇪',
  '🇳🇬',
  '🇳🇱',
  '🇳🇵',
  '🇳🇺',
  '🇴🇲',
  '🇵🇪',
  '🇵🇭',
  '🇵🇱',
  '🇵🇳',
  '🇵🇸',
  '🇵🇼',
  '🇶🇦',
  '🇷🇴',
  '🇷🇼',
  '🇸🇦',
  '🇸🇧',
  '🇸🇩',
  '🇸🇬',
];

function Languages({}: Props) {
  const [randomFlags, setFlags] = React.useState(flags);

  useEffect(() => {
    setFlags(shuffle(flags));
  }, []);
  return (
    <Stack
      sx={(theme) => ({
        maxWidth: '100%',
        overflow: 'hidden',
        ['.slide-left, .slide-right']: {
          display: 'flex',
          flexDirection: 'row',
          animation: 'infinite-scroll 60s linear infinite',
        },
        ['.slide-right']: {
          animationDirection: 'reverse',
        },
        ['.slide-item']: {
          fontSize: '4rem',
        },
        ['@keyframes infinite-scroll']: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
      })}
      suppressHydrationWarning
    >
      <Stack>
        <Stack sx={{ textAlign: 'center' }}>
          <span className="text-base font-semibold leading-7 text-indigo-500">
            Global Reach
          </span>
          <h3 className="mb-6 text-3xl font-bold text-center sm:text-4xl">
            +100 languages supported
          </h3>
        </Stack>
        <section className="flex flex-col -space-y-8">
          <div className="slider">
            <div
              className="space-x-4 slide-left"
              style={
                {
                  // width: 'calc(12240px)',
                }
              }
            >
              {randomFlags.map((each) => (
                <div key={each} className="slide">
                  <span className="slide-item ">{each}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="slider">
            <div
              className="h-auto space-x-4 slide-right"
              style={
                {
                  // width: 'calc(12240px)',
                }
              }
            >
              {flags.map((each) => (
                <div key={each} className="slide">
                  <span className="slide-item ">{each}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Stack>
    </Stack>
  );
}

export default Languages;
