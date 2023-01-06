import { useState } from 'react';

export default function Home() {
	const [logged, setLoggedIn] = useState(false);

	return (
		<div>
			<input placeholder='user' />
			<input placeholder='password' type='password' />
		</div>
	);
}
