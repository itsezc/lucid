export const Navbar = () => {
	return (
		<div className='f:11 f:semibold p:16 w:180 br:1|solid|#2e343f'>
			<ul className='flex:col {flex;ai:center;gap:8;my:12;cursor:pointer}>*'>
				<li>
					<i className='ri-home-line' />
					Home
				</li>
			</ul>
			<div className='d:block h:1 bg:#2e343f my:16' />
			<ul className='flex:col {flex;ai:center;gap:8;my:12;cursor:pointer}>*'>
				<li>
					<i className='ri-database-2-line' />
					SQL Query
				</li>
				<li>
					<i className="ri-grid-line" /> Tables
				</li>
				<li>
					<i className="ri-lock-unlock-line" /> Logins
				</li>
				<li>
					<i className="ri-key-2-line" />
					Tokens
				</li>
				<li>
					<i className="ri-at-line" />
					Scopes
				</li>
			</ul>
			<div className='d:block h:1 bg:#2e343f my:16' />
			<ul className='flex:col {flex;ai:center;gap:8;my:12;cursor:pointer}>*'>
				<li>
					<i className="ri-file-list-3-line" />
					Logs
				</li>
				<li>
					<i className="ri-line-chart-line" />
					Stats
				</li>
				<li>
					<i className="ri-settings-line" />
					Settings
				</li>
			</ul>
		</div>
	);
};
