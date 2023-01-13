'use client';

import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSurreal } from '../../surreal/hooks';
import { Navbar } from '../../components/Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
	const { isAuth, ns, db } = useSurreal();
	const router = useRouter();

	if (!isAuth) {
		router.replace('/');
	}

	return (
		<div className='bg:#171a21 fg:#ffffff h:100vh max-h:100vh flex:col'>
			<div className='flex flex:col h:full'>
				<div className='flex ai:center bb:1|solid|#2e343f'>
					<div className='p:8 min-w:360 br:1|solid|#2e343f'>
						<div className='flex ai:center gap:16 px:8'>
							<Link
								href='https://surrealdb.com/?ref=surreal_editor'
								target='_blank'
							>
								<img
									src='https://surrealdb.com/static/img/assets/icon/icon-3fccfc517c1fa85d61441f736f7bb6ac.svg'
									alt='SurrealDB Logo'
									className='h:32 w:32 bg:#222632 p:2 r:4'
								/>
							</Link>

							<div>
								<p className='f:8 fg:gray-60'>NS: {ns}</p>
								<h2 className='f:12 fg:gray-70'>{db}</h2>
							</div>
						</div>
					</div>

					<div className='flex flex:1 px:16 jc:space-between ai:center'>
						<div>
							<Link
								href='https://surrealdb.com/docs/?ref=surreal-editor'
								target='_blank'
							>
								<div className='f:12 bg:#232632 h:28 w:28 box-shadow:0.3|1|black flex ai:center jc:center r:8'>
									<i className='ri-information-line' />
								</div>
							</Link>
						</div>

						<div>
							<div className='f:12 bg:#232632 h:28 w:28 box-shadow:0.3|1|1|black flex ai:center jc:center r:8'>
								<i className='ri-search-line' />
							</div>
						</div>
					</div>
				</div>
				<div className='flex flex:1'>
					<Navbar />
					{children}
				</div>
			</div>
		</div>
	);
}
