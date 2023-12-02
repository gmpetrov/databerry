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
  let state = JSON.parse(searchParams.get('state') || '{}') as {
    title: string;
    channelThumbnail: string;
    videoThumbnail: string;
  };

  const isFallback =
    !state?.title || !state?.channelThumbnail || !state?.videoThumbnail;

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
        {isFallback && (
          <div tw="flex flex-col w-full h-full justify-center items-center">
            <img
              src={`https://chaindesk.ai/app-logo-light.png`}
              alt="Chaindesk Logo"
              style={{
                width: 977 * 0.4,
                height: 179 * 0.4,
              }}
              width={977}
              height={179}
            />

            <h1 tw="text-7xl mt-12">Free AI Youtube Summarizer</h1>
          </div>
        )}
        {!isFallback && (
          <>
            <div tw="w-1/2 flex h-full p-2 border-8 border-black">
              <div tw="flex flex-col justify-center items-center w-full text-center">
                <div tw="flex flex-col w-full h-full justify-center items-center">
                  {/* <div tw="flex w-52 h-52 rounded-full border-8 border-black overflow-hidden "> */}
                  {/* <img
                      src={state?.channelThumbnail}
                      alt="Video thumbnail"
                      tw="w-42 h-auto aspect-squqre"
                      width={100}
                      height={100}
                    />
                  </div> */}

                  <h1 tw="flex flex-col text-2xl sm:text-3xl font-bold text-gray-900 justify-center">
                    <span>{state.title}</span>
                  </h1>
                </div>

                {/* <div tw="flex flex-col w-full h-1/2 justify-center items-center bg-gray-100">
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

            </div> */}
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
          </>
        )}
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
