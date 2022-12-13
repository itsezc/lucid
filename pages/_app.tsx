import type { AppProps } from 'next/app';

import '@master/normal.css';
import Master from '@master/css';

import 'remixicon/fonts/remixicon.css';
import '../styles/global.css';

import { TerminalContextProvider } from 'react-terminal';
import { SurrealProvider } from '../surreal/context';

const master = new Master();

export default function App({ Component, pageProps }: AppProps) {
	return (
		<SurrealProvider
			url='http://localhost:8000/rpc'
			user='root'
			pass='root'
			ns='foretag'
			db='workshop'
		>
			<TerminalContextProvider>
				<Component {...pageProps} />
			</TerminalContextProvider>
		</SurrealProvider>
	);
}
