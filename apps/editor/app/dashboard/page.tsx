'use client';

import React, { useEffect } from 'react';

import { useSurreal } from '../../surreal/hooks';

export default function Page() {
	const { namespaces } = useSurreal();

	return (
		<div>
			<h1>Namespaces</h1>

			{namespaces.map((ns) => (
				<div key={ns}>
					<p>{ns}</p>
				</div>
			))}
		</div>
	);
}
