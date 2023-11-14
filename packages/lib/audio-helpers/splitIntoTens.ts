//  ffmpeg has the start set to a negative value
const splitIntoTens = (num: number) => [
  -60 * 9.5,
  ...Array(Math.floor(num / (60 * 10))).fill(60 * 10),
  60 * 12,
];

export default splitIntoTens;
