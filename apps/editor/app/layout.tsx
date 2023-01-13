'use client';

import React from 'react';

import { Inter } from '@next/font/google';

import '@master/normal.css';
import 'remixicon/fonts/remixicon.css';

import './global.css';
import { SurrealProvider } from '../surreal/context';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode | React.ReactNode[];
}) {
	return (
		<html lang='en' className={inter.className}>
			<head />
			<body>
				<SurrealProvider>{children}</SurrealProvider>
			</body>
		</html>
	);
}
