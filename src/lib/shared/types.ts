export type NoticeType = 'offer' | 'request' | 'event' | 'alert' | 'other';

export type NoticeStatus = 'visible' | 'pending_review' | 'hidden';

export type BoardVisibility = 'public' | 'private';

export type CardFont = 'marker' | 'typewriter' | 'handwritten' | 'classic';

export interface User {
	id: string;
	name: string;
	verified: boolean;
	trustScore: number;
	createdAt: string;
}

export interface Circle {
	ownerId: string;
	memberId: string;
	createdAt: string;
}

export interface Noticeboard {
	id: string;
	name: string;
	visibility: BoardVisibility;
	ownerId: string | null; // set only for private boards
}

export interface Notice {
	id: string;
	legacyId: number | null;
	boardId: string;
	type: NoticeType;
	title: string;
	body: string;
	authorId: string | null; // null = unknown author
	createdAt: string;
	status: NoticeStatus;
	importFlags: string[];
	cardImageUrl: string | null; // optional, poster-supplied URL — no file upload/blob storage
	cardCaption: string | null; // short line for the card face; falls back to title if unset
	cardFont: CardFont | null; // preset display font for the card face; falls back to a default
}

export interface Reply {
	id: string;
	noticeId: string;
	authorId: string | null;
	body: string;
	createdAt: string;
	status: NoticeStatus; // same trust & safety pipeline as Notice, see evaluateTrustAndSafety
}

export interface TrustEvent {
	id: string;
	userId: string;
	delta: number;
	reason: string;
	noticeId: string | null;
	createdAt: string;
}
