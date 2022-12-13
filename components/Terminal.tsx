import { ReactTerminal } from 'react-terminal';
import { useSurreal } from '../surreal/hooks';

export const Terminal = () => {
	const { use, db, user } = useSurreal();

	const commands = {
		whoami: user,
		use: (ns: string) => {
			use(ns, db || '');
			return `Switched to ${ns} and db: ${db}`;
		},
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
