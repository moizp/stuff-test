import type { Circle, Notice, Noticeboard, Reply, TrustEvent, User } from '$lib/shared/types';

export type NewUser = Omit<User, 'id' | 'createdAt' | 'trustScore'> & { trustScore?: number };
export type NewNoticeboard = Omit<Noticeboard, 'id'>;
export type NewNotice = Omit<Notice, 'id' | 'createdAt'> & { createdAt?: string };
export type NewReply = Omit<Reply, 'id' | 'createdAt'> & { createdAt?: string };
export type NewTrustEvent = Omit<TrustEvent, 'id' | 'createdAt'>;

/**
 * Storage boundary. Swap the in-memory implementation for a persistent one
 * (SQLite, Postgres, ...) by implementing this same interface — nothing
 * above this layer (services, routes) needs to change.
 */
export interface Repository {
	users: {
		create(input: NewUser): Promise<User>;
		findById(id: string): Promise<User | null>;
		findByName(name: string): Promise<User | null>;
		update(id: string, patch: Partial<Pick<User, 'verified' | 'trustScore'>>): Promise<User>;
		list(): Promise<User[]>;
	};
	circles: {
		add(ownerId: string, memberId: string): Promise<Circle>;
		listMembers(ownerId: string): Promise<string[]>;
		isMember(ownerId: string, userId: string): Promise<boolean>;
	};
	noticeboards: {
		create(input: NewNoticeboard): Promise<Noticeboard>;
		findById(id: string): Promise<Noticeboard | null>;
		findPublicByName(name: string): Promise<Noticeboard | null>;
		list(): Promise<Noticeboard[]>;
	};
	notices: {
		create(input: NewNotice): Promise<Notice>;
		findById(id: string): Promise<Notice | null>;
		listByBoard(boardId: string): Promise<Notice[]>;
		findDuplicate(input: {
			boardId: string;
			title: string;
			body: string;
			authorId: string | null;
		}): Promise<Notice | null>;
	};
	replies: {
		create(input: NewReply): Promise<Reply>;
		listByNotice(noticeId: string): Promise<Reply[]>;
	};
	trustEvents: {
		create(input: NewTrustEvent): Promise<TrustEvent>;
		listByUser(userId: string): Promise<TrustEvent[]>;
	};
}
