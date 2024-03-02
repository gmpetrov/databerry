export const metadata = {
  title: 'Reset Password - Creative',
  description: 'Page description',
};

export default function ResetPassword() {
  return (
    <>
      {/* Page header */}
      <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
        <h1 className="font-bricolage-grotesque text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-zinc-900 to-zinc-900">
          Reset your password
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-[25rem] mx-auto p-6 rounded-lg shadow-2xl bg-gradient-to-b from-zinc-100 to-zinc-50/70 relative before:absolute before:-top-12 before:-left-16 before:w-96 before:h-96 before:bg-zinc-900 before:opacity-[.15] before:rounded-full before:blur-3xl before:-z-10">
        <form>
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm text-zinc-800 font-medium mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                className="form-input text-sm w-full"
                type="email"
                placeholder="mark@acmecorp.com"
                required
              />
            </div>
          </div>
          <div className="mt-5">
            <button className="btn text-zinc-100 bg-zinc-900 hover:bg-zinc-800 w-full shadow">
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
