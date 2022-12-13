import type { AppProps } from 'next/app';

import '@master/normal.css';
import Master from '@master/css';

import 'remixicon/fonts/remixicon.css';

import Surreal from 'surrealdb.js';

const master = new Master();

export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
