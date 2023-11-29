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
  let state = JSON.parse(searchParams.get('state') || '{}') as {
    title: string;
    channelThumbnail: string;
    videoThumbnail: string;
  };

  console.log('state', state);

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
        <div tw="w-1/2 flex h-full p-2">
          <div tw="flex flex-col justify-center items-center w-full text-center">
            <div tw="flex flex-col w-full h-1/2 justify-center items-center">
              <div tw="flex w-42 h-42 rounded-full border-4 border-black overflow-hidden ">
                <img
                  src={state?.channelThumbnail}
                  alt="Video thumbnail"
                  tw="w-42 h-auto aspect-squqre"
                  width={100}
                  height={100}
                />
              </div>

              <h1 tw="flex flex-col text-3xl sm:text-4xl font-bold text-gray-900 justify-center">
                <span>Lex Fridman</span>
              </h1>
            </div>

            <div tw="flex flex-col w-full h-1/2 justify-center items-center bg-gray-100">
              <img
                src={`https://chaindesk.ai/app-logo-light.png`}
                alt="Chaindesk Logo"
                style={{
                  width: 977 * 0.3,
                  height: 179 * 0.3,
                }}
                width={977}
                height={179}
              />

              {/* <h1 tw="flex flex-col text-3xl sm:text-4xl font-bold text-gray-900 justify-center">
                <span tw="text-indigo-600">Free Youtube Video Summary.</span>
              </h1> */}
            </div>
          </div>
        </div>
        <div tw="w-1/2 flex h-full  flex-col">
          <img
            src={state?.videoThumbnail}
            alt="Video thumbnail"
            tw="w-full h-full aspect-auto mt-auto"
            width={100}
            height={100}
          />
        </div>
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
