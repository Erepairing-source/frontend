import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Load config.js before the app so window.__API_BASE__ can override the API URL at runtime
 * (e.g. set in public/config.js to your backend URL so one build works on AWS without rebuilding).
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script src="/config.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
