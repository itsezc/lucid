import { Field, Model, TAssertHandler, TPermissions, SubsetModel } from '@lucid-framework/orm';
import { Constructor } from 'type-fest';

/**
 * Lucid.Define({
 *
 * })
 *or

    class User extends Model {
      @Field({ index: 'unique' })
      username: string;

      @Field({ assert: 'email', name: 'email_address', index: "unique" })
      email?: string;

      followers?: Lucid.Relation<Follows, User> = Lucid.Relation<Follows, User>(Follows, 'OUT', 'followers');
    }

    Lucid.Define(User, {
      name: 'user',
      permissions: ({ username }) => [],
      auditable: true,
      fields: {
        username: { index: 'unique' },
        email: { assert: 'email', name: 'email_address', index: "unique" },
        followers: { relation: { model: Follows, direction: 'OUT', name: 'followers' } }
      }
    })
 *
 *
 *
 */

// function applyMixins(derivedCtor: any, constructors: any[]) {
// 	constructors.forEach((baseCtor) => {
// 		Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
// 			Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null));
// 		});
// 	});
// }

type LucidDefinitionOptions<T extends Model, Name extends string> = {
	name: Name;
	permissions?: TPermissions<T>;
	auditable?: boolean;
	fields: {
		[K in keyof Partial<SubsetModel<T>>]: {
			index?: 'unique' | 'index';
			assert?: TAssertHandler<T>;
			permissions?: TPermissions<T>;
			name?: string;
			relation?: {
				model: Constructor<Model>;
				direction: 'IN' | 'OUT';
				name?: string;
			};
		};
	};
};

class Lucid {
	public static definitions = new Map();

	static Define<T extends Constructor<Model>, Name extends string>(model: T, options: LucidDefinitionOptions<InstanceType<T>, Name>) {
		const name = model.name;

		this.definitions.set(name, {
			model,
			options,
		});

		return model;
	}
}

class Follows extends Model {
	public inside: User;
	public outside: User;
}

class Post extends Model {
	public title: string;
	public content: string;
}

class User extends Model {
	username: string;
	email?: string;
	posts?: Post[];
	followers: Follows[];
}

Lucid.Define(User, {
	name: 'user',
	permissions: ({ username }) => [],
	fields: {
		username: {
			name: 'username',
			index: 'unique',
		},
		email: {
			assert: 'email',
		},
		followers: {
			relation: {
				model: Follows,
				direction: 'OUT',
			},
		},
	},
});

console.log(Lucid.definitions);
// interface User extends Follows {}

// const related = Lucid.Relation("followers", Follows, User, 'OUT');
// const t = new related();

// const user = new User();

// console.log(user);
