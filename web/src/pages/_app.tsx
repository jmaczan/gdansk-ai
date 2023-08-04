import { AppProps } from 'next/app';
import React from 'react';

import 'styles/page.css';
import 'styles/globals.css';

import Head from 'next/head';
import { UserProvider } from '@auth0/nextjs-auth0/client';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Head>
        <title>^_^ Gdańsk AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <React.StrictMode>
        <Component {...pageProps} />
      </React.StrictMode>
    </UserProvider >
  );
}

export default MyApp;
