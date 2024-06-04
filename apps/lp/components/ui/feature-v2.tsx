export default function Example(props: {
  label?: string;
  title?: string;
  description?: string;
  features?: { name?: string; description?: string; icon?: any }[];
}) {
  return (
    <div className="py-24 sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto sm:text-center">
          <p className="text-3xl font-bold leading-7 text-pink-400 font-label">
            This is it
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-title">
            {props?.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {props?.description}
          </p>
        </div>
      </div>
      <div className="relative pt-16 overflow-hidden">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <iframe
            //   className="w-full h-[300px] rounded-2xl"
            //   width="560"
            className="w-full rounded-3xl aspect-video"
            src={`https://www.youtube.com/embed/lj-EGeEOggU`}
            title="YouTube video player"
            frameBorder="0"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
          {/* <img
            src="/images/dashboard-screenshot.png"
            alt="App screenshot"
            className="shadow-2xl rounded-xl ring-1 ring-gray-900/10"
            // className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            width={2432}
            height={1442}
          /> */}
          {/* <div className="relative" aria-hidden="true">
            <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[7%]" />
          </div> */}
        </div>
      </div>
      <div className="px-6 mx-auto mt-16 max-w-7xl sm:mt-20 md:mt-24 lg:px-8">
        <dl className="grid max-w-2xl grid-cols-1 mx-auto text-xl leading-7 text-gray-600 gap-x-6 gap-y-10 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {(props?.features || []).map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-gray-900 font-title">
                <feature.icon
                  className="absolute top-0 left-0 w-6 h-6 text-pink-500"
                  aria-hidden="true"
                />
                {feature.name}
              </dt>{' '}
              <dd className="inline">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
