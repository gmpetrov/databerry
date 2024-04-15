import Footer from '@chaindesk/ui/lp/footer';
import Header from '@chaindesk/ui/lp/header';

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      <Footer />
    </>
  );
}
