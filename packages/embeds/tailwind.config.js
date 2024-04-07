import sharedConfig from '@chaindesk/config-tailwind';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./js/**/*.{js,ts,jsx,tsx}', '../ui/src/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedConfig],
};
