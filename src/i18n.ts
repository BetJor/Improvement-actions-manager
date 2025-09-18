import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// A list of all locales that are supported
const locales = ['ca', 'es'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is a valid locale
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}/common.json`)).default,
  };
});
