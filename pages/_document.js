import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Custom document. Runtime config (window.__API_BASE__) is loaded in _app.js via
 * next/script (strategy="beforeInteractive") to avoid synchronous scripts here.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
