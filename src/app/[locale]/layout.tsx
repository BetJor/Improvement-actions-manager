
import { ProtectedLayout } from "@/components/protected-layout";
import { getMessages, getLocale } from "next-intl/server";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();
  const locale = await getLocale();
  
  return (
    <ProtectedLayout locale={locale} messages={messages}>
      {children}
    </ProtectedLayout>
  )
}
