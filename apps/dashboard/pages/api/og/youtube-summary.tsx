import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
export const config = {
  runtime: 'edge',
};

const JoseinSansRegularFontP = fetch(
  new URL(
    '../../../public/shared/fonts/JosefinSans-Regular.ttf',
    import.meta.url
  )
).then((res) => res.arrayBuffer());

const JoseinSansBoldFontP = fetch(
  new URL('../../../public/shared/fonts/JosefinSans-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler(request: NextRequest) {
  const [JoseinSansRegularFont, JoseinSansBoldFont] = await Promise.all([
    JoseinSansRegularFontP,
    JoseinSansBoldFontP,
  ]);
  const { searchParams } = request.nextUrl;
  let state = JSON.parse(searchParams.get('state') || '{}') as {
    title: string;
    channelThumbnail: string;
    videoThumbnail: string;
  };

  // const isFallback =
  //   !state?.title || !state?.channelThumbnail || !state?.videoThumbnail;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          //   justifyContent: 'center',
          backgroundColor: 'white',
          fontFamily: 'Josefin Sans',
        }}
      >
        <>
          <div tw="flex relative flex-col w-full h-full">
            <img
              src={state?.videoThumbnail}
              alt="Video thumbnail"
              tw="w-full h-full"
              style={{ objectFit: 'cover' }}
              width={1000}
              height={1000}
            />
          </div>
        </>
      </div>
    ),
    {
      // width: 1200,
      // height: 630,
      width: 600,
      height: 315,
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
