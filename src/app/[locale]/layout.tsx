
import { ProtectedLayout } from "@/components/protected-layout";
import {unstable_setRequestLocale} from 'next-intl/server';
import { useMessages, useLocale } from "next-intl";

export default function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  unstable_setRequestLocale(locale);
  const messages = useMessages();
  const messagesLocale = useLocale();
  
  return (
    <ProtectedLayout locale={messagesLocale} messages={messages}>
      {children}
    </ProtectedLayout>
  )
}
