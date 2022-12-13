import type { AppProps } from 'next/app';

import '@master/normal.css';
import Master from '@master/css';

import 'remixicon/fonts/remixicon.css';
import '../styles/global.css';

import { TerminalContextProvider } from 'react-terminal';

const master = new Master();

export default function App({ Component, pageProps }: AppProps) {
	return (
		<TerminalContextProvider>
			<Component {...pageProps} />
		</TerminalContextProvider>
	);
}
