export default function Blocks() {
  return (
    <section>
      <div className="pb-12 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-16 text-center">
            {/* Item #1 */}
            <div>
              <div className="w-8 h-8 bg-slate-50 border border-zinc-200 rounded-md inline-flex items-center justify-center mb-3">
                <svg
                  className="fill-zinc-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="17"
                >
                  <path d="M.72 16.053c-.5-.2-.8-.7-.7-1.2l4-14c.2-.6.7-.9 1.3-.8.5.2.8.7.7 1.3l-4 14c-.2.5-.7.8-1.3.7Zm13.3-.7-4-14c-.1-.6.2-1.1.7-1.3.5-.2 1.1.2 1.2.7l4 14c.2.5-.2 1.1-.7 1.2-.5.2-1-.1-1.2-.6Zm-7-11.3h2v2h-2v-2Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2Z" />
                </svg>
              </div>
              <h3 className="font-bricolage-grotesque font-semibold text-zinc-800 mb-1">
                Personal
              </h3>
              <p className="text-sm text-zinc-500">
                We can help you choose the right plan for your team.
              </p>
            </div>
            {/* Item #2 */}
            <div>
              <div className="w-8 h-8 bg-slate-50 border border-zinc-200 rounded-md inline-flex items-center justify-center mb-3">
                <svg
                  className="fill-zinc-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="13"
                >
                  <path d="M1 0a1 1 0 0 1 1 1v11a1 1 0 0 1-2 0V1a1 1 0 0 1 1-1Zm4 5a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1Zm4-2a1 1 0 0 1 1 1v8a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1Zm4 5a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1Z" />
                </svg>
              </div>
              <h3 className="font-bricolage-grotesque font-semibold text-zinc-800 mb-1">
                Metrics
              </h3>
              <p className="text-sm text-zinc-500">
                We can help you choose the right plan for your team.
              </p>
            </div>
            {/* Item #3 */}
            <div>
              <div className="w-8 h-8 bg-slate-50 border border-zinc-200 rounded-md inline-flex items-center justify-center mb-3">
                <svg
                  className="fill-zinc-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="14"
                >
                  <path d="M.5 0h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 0Zm13 12h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Zm-11-8h6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Zm3 4h8a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Z" />
                </svg>
              </div>
              <h3 className="font-bricolage-grotesque font-semibold text-zinc-800 mb-1">
                Flexible
              </h3>
              <p className="text-sm text-zinc-500">
                We can help you choose the right plan for your team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
