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
			url={process.env.NEXT_PUBLIC_SURREAL_HOST}
			user={process.env.NEXT_PUBLIC_SURREAL_USER}
			pass={process.env.NEXT_PUBLIC_SURREAL_PASS}
			ns={process.env.NEXT_PUBLIC_SURREAL_NS}
			db={process.env.NEXT_PUBLIC_SURREAL_DB}
		>
			<TerminalContextProvider>
				<Component {...pageProps} />
			</TerminalContextProvider>
		</SurrealProvider>
	);
}
