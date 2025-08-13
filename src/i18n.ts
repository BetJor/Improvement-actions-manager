import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['ca', 'es'];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: {
      ...(await import(`../messages/${locale}/common.json`)).default,
      ...(await import(`../messages/${locale}/dashboard.json`)).default,
      ...(await import(`../messages/${locale}/actions.json`)).default,
      ...(await import(`../messages/${locale}/settings.json`)).default,
      ...(await import(`../messages/${locale}/ai-settings.json`)).default,
      ...(await import(`../messages/${locale}/prompt-gallery.json`)).default,
      ...(await import(`../messages/${locale}/user-management.json`)).default,
      ...(await import(`../messages/${locale}/my-groups.json`)).default,
      ...(await import(`../messages/${locale}/roadmap.json`)).default,
    }
  };
});
