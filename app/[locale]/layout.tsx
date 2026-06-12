import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import SessionProvider from '@/providers/SessionProvider';

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <SessionProvider>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
