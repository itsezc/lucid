import { ReactTerminal } from 'react-terminal';
import Surreal from 'surrealdb.js';

export const Terminal = () => {
	const commands = {
		whoami: 'jackharper',
		cd: (directory: string) => `changed path to ${directory}`,
		use: (ns: string, db: string) => Surreal.Instance.use(ns, db),
	};

	return (
		<ReactTerminal
			commands={commands}
			showControlBar={false}
			themes={{
				'my-custom-theme': {
					themeBGColor: '#272B36',
					themeToolbarColor: '#DBDBDB',
					themeColor: '#FFFEFC',
					themePromptColor: '#a917a8',
				},
			}}
			theme='my-custom-theme'
		/>
	);
};
