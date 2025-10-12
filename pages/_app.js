import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
