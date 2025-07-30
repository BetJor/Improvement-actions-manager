import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['ca', 'es'],
  defaultLocale: 'ca'
});
 
export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)']
};