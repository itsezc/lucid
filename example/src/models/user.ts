import { Table, Model, Field, Index, SurrealEvent } from "@lucid-framework/orm";
import { AdminScope } from "./scopes.js";

@Table({ name: "roles" })
export class Role extends Model {
	@Field({ index: "unique" }) name!: "admin" | "user" | "whitelist";
	@Field() description?: string;
	@Field() hexColor?: string;
	@Field() global!: boolean;
	@Field() createdDate!: Date;
}

@Table({ name: "setting"})
export class Setting extends Model {
	@Field({ index: "unique" }) key!: string;
	@Field() value!: string;
}

@Table({ name: "session"})
export class Session extends Model {
	sessionToken!: string;
	expires!: Date;
	user!: User;
}

@Table({ name: "account" })
export class Account extends Model {
	@Field({ index: "unique" }) providerAccountId!: string;
	@Field() type!: string;
	@Field() provider!: string;
	@Field() refreshToken?: string;
	@Field() accessToken?: string;
	@Field() expiresAt?: number;
	@Field() token_type?: string;
	@Field() scope?: string;
	@Field() idToken?: string;
	@Field() sessionState?: Date;
	@Field() user!: User;
	@Field() profile?: string;

	@Index<Account>({ columns: ['provider', 'providerAccountId'] })
	private idx_meta: any;
}

@Table({ name: 'user',
	permissions: ({ username }) => [[['CREATE', 'UPDATE', 'SELECT'], true], ['DELETE', AdminScope]],
	auditable: true,
})
export class User extends Model {
	@Field({ index: 'unique' }) username!: string;
	@Field({ index: 'unique' }) walletAddress!: string;
	@Field({ index: 'unique' }) email?: string | null;

	@Field() emailVerified?: Date | null;

	@Field() avatar?: string;
	@Field() bannerPicture?: string;

	@Field() bio?: string;
	@Field() role!: Role;

	@Field() settings?: Setting[];
	@Field() sessions?: Session[];
	@Field() accounts?: Account[];

	@Field() updatedAt?: Date = new Date();
	@Field() createdDate?: Date = new Date();

	private changeUsernameEvent = new SurrealEvent<User>({
		name: "change_username",
		when: ({ $after, $before, $event }) => $event === "DELETE",
		then: ({ $after, $before }) => "",
	});
}

@Table({ name: 'verificationToken'})
export class VerificationToken extends Model {
	@Field({index: "unique"}) token!: string;
	@Field() expires!: Date;
	@Field() identifier!: string;

	@Index<VerificationToken>({ 
		columns: ['identifier', 'token'],
	})
	private idx_meta: any;
}
