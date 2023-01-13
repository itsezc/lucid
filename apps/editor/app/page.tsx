'use client';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useSurreal } from '../surreal/hooks';

export default function Page() {
	const { auth, isAuth } = useSurreal();
	const router = useRouter();

	const [host, setHost] = useState('');
	const [user, setUser] = useState('');
	const [pass, setPass] = useState('');

	useEffect(() => {
		if (isAuth) {
			router.push('/dashboard');
		}
	}, [isAuth]);

	return (
		<div>
			<input
				value={host}
				onChange={(e) => setHost(e.currentTarget.value)}
				placeholder='hostname'
			/>
			<input
				value={user}
				onChange={(e) => setUser(e.currentTarget.value)}
				placeholder='user'
			/>
			<input
				value={pass}
				onChange={(e) => setPass(e.currentTarget.value)}
				placeholder='password'
				type='password'
			/>

			<button
				onClick={async () => {
					await auth(host, user, pass);
				}}
			>
				Login
			</button>
		</div>
	);
}
