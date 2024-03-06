export default function Community() {
  return (
    <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-50 before:-z-10">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-bricolage-grotesque text-3xl font-bold text-zinc-900">
              Join the Community
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-8">
            {/* Item #1 */}
            <div className="flex flex-col p-4 border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg shadow shadow-black/5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="fill-zinc-100"
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="16"
                  >
                    <path d="M18.624 1.326A18.784 18.784 0 0 0 14.146.001a.07.07 0 0 0-.072.033c-.193.328-.408.756-.558 1.092a17.544 17.544 0 0 0-5.03 0A10.86 10.86 0 0 0 7.922.034.072.072 0 0 0 7.849 0C6.277.26 4.774.711 3.37 1.326a.063.063 0 0 0-.03.024C.49 5.416-.292 9.382.091 13.298c.002.02.013.038.029.05a18.598 18.598 0 0 0 5.493 2.65.073.073 0 0 0 .077-.025c.423-.551.8-1.133 1.124-1.744.02-.036 0-.079-.038-.093a12.278 12.278 0 0 1-1.716-.78.066.066 0 0 1-.007-.112c.115-.082.23-.168.34-.255a.07.07 0 0 1 .072-.009c3.6 1.569 7.498 1.569 11.056 0a.07.07 0 0 1 .072.008c.11.087.226.174.342.256a.066.066 0 0 1-.006.112c-.548.305-1.118.564-1.717.78a.066.066 0 0 0-.038.093c.33.61.708 1.192 1.123 1.743a.072.072 0 0 0 .078.025 18.538 18.538 0 0 0 5.502-2.65.067.067 0 0 0 .028-.048c.459-4.528-.768-8.461-3.252-11.948a.055.055 0 0 0-.03-.025ZM7.352 10.914c-1.084 0-1.977-.95-1.977-2.116 0-1.166.875-2.116 1.977-2.116 1.11 0 1.994.958 1.977 2.116 0 1.166-.876 2.116-1.977 2.116Zm7.31 0c-1.084 0-1.977-.95-1.977-2.116 0-1.166.876-2.116 1.977-2.116 1.11 0 1.994.958 1.977 2.116 0 1.166-.867 2.116-1.977 2.116Z" />
                  </svg>
                </div>
                <h3 className="font-bricolage-grotesque font-semibold text-zinc-800">
                  Discord
                </h3>
              </div>
              <p className="grow text-sm text-zinc-500">
                Engage in real time conversations with us!
              </p>
              <div className="text-right">
                <a
                  className="inline-flex items-center font-medium text-sm mt-4"
                  href="#0"
                >
                  Talk to us
                  <svg
                    className="shrink-0 ml-1 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="9"
                    height="9"
                  >
                    <path d="m1.285 8.514-.909-.915 5.513-5.523H1.663l.01-1.258h6.389v6.394H6.794l.01-4.226z" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Item #2 */}
            <div className="flex flex-col p-4 border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg shadow shadow-black/5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="fill-zinc-100"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="19"
                  >
                    <path d="M10.041 0C4.52 0 0 4.382 0 9.737c0 4.3 2.845 7.952 6.862 9.25.502.081.669-.243.669-.487v-1.622c-2.761.568-3.347-1.299-3.347-1.299-.419-1.136-1.088-1.46-1.088-1.46-1.004-.568 0-.568 0-.568 1.004.08 1.506.973 1.506.973.92 1.461 2.343 1.055 2.929.812.084-.65.335-1.055.67-1.298-2.26-.244-4.603-1.055-4.603-4.788 0-1.055.419-1.947 1.004-2.596 0-.325-.418-1.299.168-2.597 0 0 .836-.243 2.761.974.837-.244 1.673-.325 2.51-.325.837 0 1.674.081 2.51.325 1.925-1.298 2.762-.974 2.762-.974.586 1.38.167 2.353.084 2.597.669.649 1.004 1.541 1.004 2.596 0 3.733-2.343 4.544-4.603 4.788.335.324.67.892.67 1.785V18.5c0 .244.167.568.67.487 4.016-1.298 6.86-4.95 6.86-9.25C20.084 4.382 15.565 0 10.042 0Z" />
                  </svg>
                </div>
                <h3 className="font-bricolage-grotesque font-semibold text-zinc-800">
                  GitHub
                </h3>
              </div>
              <p className="grow text-sm text-zinc-500">
                Engage in real time conversations with us!
              </p>
              <div className="text-right">
                <a
                  className="inline-flex items-center font-medium text-sm mt-4"
                  href="#0"
                >
                  Contribute
                  <svg
                    className="shrink-0 ml-1 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="9"
                    height="9"
                  >
                    <path d="m1.285 8.514-.909-.915 5.513-5.523H1.663l.01-1.258h6.389v6.394H6.794l.01-4.226z" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Item #3 */}
            <div className="flex flex-col p-4 border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg shadow shadow-black/5">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="fill-zinc-100"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="16"
                  >
                    <path d="M8.096 10.409 3.117 16H.355l6.452-7.248L0 0h5.695L9.63 5.115 14.176 0h2.76L10.91 6.78 18 16h-5.555l-4.349-5.591Zm5.111 3.966h1.53L4.864 1.54h-1.64l9.984 12.836Z" />
                  </svg>
                </div>
                <h3 className="font-bricolage-grotesque font-semibold text-zinc-800">
                  Twitter / X
                </h3>
              </div>
              <p className="grow text-sm text-zinc-500">
                Engage in real time conversations with us!
              </p>
              <div className="text-right">
                <a
                  className="inline-flex items-center font-medium text-sm mt-4"
                  href="#0"
                >
                  Follow us
                  <svg
                    className="shrink-0 ml-1 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="9"
                    height="9"
                  >
                    <path d="m1.285 8.514-.909-.915 5.513-5.523H1.663l.01-1.258h6.389v6.394H6.794l.01-4.226z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
