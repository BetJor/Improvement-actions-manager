import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ca', 'es'],
 
  // Used when no locale matches
  defaultLocale: 'ca',

  // The path to the i18n configuration file
  pathnames: [],
  localePrefix: 'as-needed',
  // Specify the file with the getRequestConfig function
  localeDetection: true,
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ca|es)/:path*',

    // Enable redirects that add a locale prefix
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
