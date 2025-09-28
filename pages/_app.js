import '../styles/global.css';
import { useEffect } from 'react';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  // Apply the theme to the body when app loads or page changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboardTheme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, []);

  return (
    <>
      <Head>
        <title>Dynamic Data Insight Dashboard</title>
        <meta name="description" content="Interactive data visualization dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
