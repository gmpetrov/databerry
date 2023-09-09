import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

const JoseinSansRegularFontP = fetch(
  new URL('../../public/fonts/JosefinSans-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

const JoseinSansBoldFontP = fetch(
  new URL('../../public/fonts/JosefinSans-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler() {
  const [JoseinSansRegularFont, JoseinSansBoldFont] = await Promise.all([
    JoseinSansRegularFontP,
    JoseinSansBoldFontP,
  ]);

  return new ImageResponse(
    (
      // Modified based on https://tailwindui.com/components/marketing/sections/cta-sections
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          //   justifyContent: 'center',
          backgroundColor: 'black',
          fontFamily: 'Josefin Sans',
        }}
      >
        <img
          src="https://chaindesk.ai/app-logo-dark.png"
          alt="ChatbotGPT.ai logo"
          style={{
            objectFit: 'contain',
            width: '300px',
            height: '100%',
            marginTop: '-250px',
            marginLeft: '-800px',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Josefin Sans',
          data: JoseinSansRegularFont,
          weight: 400,
        },
        {
          name: 'Josefin Sans',
          data: JoseinSansBoldFont,
          weight: 700,
        },
      ],
    }
  );
}
