
import { ProtectedLayout } from "@/components/protected-layout";
import { getMessages } from "next-intl/server";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();
  const locale = params.locale;
  
  return (
    <ProtectedLayout locale={locale} messages={messages}>
      {children}
    </ProtectedLayout>
  )
}
