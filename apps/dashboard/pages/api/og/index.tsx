import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
export const config = {
  runtime: 'edge',
};

const JoseinSansRegularFontP = fetch(
  new URL('../../../public/fonts/JosefinSans-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

const JoseinSansBoldFontP = fetch(
  new URL('../../../public/fonts/JosefinSans-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler(request: NextRequest) {
  const [JoseinSansRegularFont, JoseinSansBoldFont] = await Promise.all([
    JoseinSansRegularFontP,
    JoseinSansBoldFontP,
  ]);
  const { searchParams } = request.nextUrl;
  const image = searchParams.get('image');

  return new ImageResponse(
    (
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
          src={`https://chaindesk.ai/${image ? image : 'app-logo-dark'}.png`}
          alt="Chaindesk logo"
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
