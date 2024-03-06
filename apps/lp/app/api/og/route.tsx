import { ImageResponse } from 'next/og';
// import { NextRequest } from 'next/server';
export const runtime = 'edge';

// const JoseinSansRegularFontP = fetch(
//   new URL('../../../public/shared/fonts/JosefinSans-Regular.ttf', import.meta.url)
// ).then((res) => res.arrayBuffer());

// const JoseinSansBoldFontP = fetch(
//   new URL('../../../public/shared/fonts/JosefinSans-Bold.ttf', import.meta.url)
// ).then((res) => res.arrayBuffer());

const BricolageGrotesqueExtraBoldFontP = fetch(
  new URL(
    '../../../public/shared/fonts/BricolageGrotesque-ExtraBold.ttf',
    import.meta.url
  )
).then((res) => res.arrayBuffer());
const BricolageGrotesqueBoldFontP = fetch(
  new URL(
    '../../../public/shared/fonts/BricolageGrotesque-Bold.ttf',
    import.meta.url
  )
).then((res) => res.arrayBuffer());
const BricolageGrotesqueRegularFontP = fetch(
  new URL(
    '../../../public/shared/fonts/BricolageGrotesque-Regular.ttf',
    import.meta.url
  )
).then((res) => res.arrayBuffer());

export async function GET(request: Request) {
  const [
    // JoseinSansRegularFont,
    // JoseinSansBoldFont,
    BricolageGrotesqueExtraBoldFont,
    BricolageGrotesqueBoldFont,
    BricolageGrotesqueRegularFont,
  ] = await Promise.all([
    // JoseinSansRegularFontP,
    // JoseinSansBoldFontP,
    BricolageGrotesqueExtraBoldFontP,
    BricolageGrotesqueBoldFontP,
    BricolageGrotesqueRegularFontP,
  ]);
  const { searchParams } = new URL(request.url);
  const image = searchParams.get('image');
  const title =
    searchParams.get('title') || `Custom GPT Agent For Your Startup`;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'Bricolage Grotesque',
          backgroundImage: `url("https://www.chaindesk.ai/og-image-background.jpg")`,
        }}
      >
        {/* <img
          src={`https://chaindesk.ai/${image ? image : 'app-logo-dark'}.png`}
          alt="Chaindesk logo"
          style={{
            objectFit: 'contain',
            width: '300px',
            height: '100%',
            marginTop: '-250px',
            marginLeft: '-800px',
          }}
        /> */}

        <h1 tw="flex flex-col justify-center mt-28 font-bold text-gray-900 px-[10%] text-center text-[2vw] sm:text-[6vw] truncate">
          <span>{title}</span>
        </h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        // {
        //   name: 'Josefin Sans',
        //   data: JoseinSansRegularFont,
        //   weight: 400,
        // },
        // {
        //   name: 'Josefin Sans',
        //   data: JoseinSansBoldFont,
        //   weight: 700,
        // },
        {
          name: 'Bricolage Grotesque',
          data: BricolageGrotesqueRegularFont,
          weight: 400,
        },
        {
          name: 'Bricolage Grotesque',
          data: BricolageGrotesqueBoldFont,
          weight: 700,
        },
        {
          name: 'Bricolage Grotesque',
          data: BricolageGrotesqueExtraBoldFont,
          weight: 900,
        },
      ],
    }
  );
}
