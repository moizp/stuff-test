import type { Circle, Notice, Noticeboard, Reply, TrustEvent, User } from '$lib/shared/types';
import type {
	NewNotice,
	NewNoticeboard,
	NewReply,
	NewTrustEvent,
	NewUser,
	Repository
} from './types';

function newId(): string {
	return crypto.randomUUID();
}

function now(): string {
	return new Date().toISOString();
}

/**
 * In-memory Repository implementation. Used identically for local dev and
 * the deployed demo — see DECISIONS.md ("Storage"). Resets on every process
 * restart; the app reseeds from seed-notices.json on boot to compensate.
 */
export function createInMemoryRepository(): Repository {
	const users = new Map<string, User>();
	const circles: Circle[] = [];
	const noticeboards = new Map<string, Noticeboard>();
	const notices = new Map<string, Notice>();
	const replies = new Map<string, Reply>();
	const trustEvents = new Map<string, TrustEvent>();

	return {
		users: {
			async create(input: NewUser) {
				const user: User = {
					id: newId(),
					name: input.name,
					verified: input.verified,
					trustScore: input.trustScore ?? 0,
					createdAt: now()
				};
				users.set(user.id, user);
				return user;
			},
			async findById(id) {
				return users.get(id) ?? null;
			},
			async findByName(name) {
				for (const user of users.values()) {
					if (user.name === name) return user;
				}
				return null;
			},
			async update(id, patch) {
				const existing = users.get(id);
				if (!existing) throw new Error(`User not found: ${id}`);
				const updated = { ...existing, ...patch };
				users.set(id, updated);
				return updated;
			},
			async list() {
				return [...users.values()];
			}
		},
		circles: {
			async add(ownerId, memberId) {
				const existing = circles.find((c) => c.ownerId === ownerId && c.memberId === memberId);
				if (existing) return existing;
				const circle: Circle = { ownerId, memberId, createdAt: now() };
				circles.push(circle);
				return circle;
			},
			async listMembers(ownerId) {
				return circles.filter((c) => c.ownerId === ownerId).map((c) => c.memberId);
			},
			async isMember(ownerId, userId) {
				return circles.some((c) => c.ownerId === ownerId && c.memberId === userId);
			}
		},
		noticeboards: {
			async create(input: NewNoticeboard) {
				const board: Noticeboard = { id: newId(), ...input };
				noticeboards.set(board.id, board);
				return board;
			},
			async findById(id) {
				return noticeboards.get(id) ?? null;
			},
			async findPublicByName(name) {
				for (const board of noticeboards.values()) {
					if (board.visibility === 'public' && board.name === name) return board;
				}
				return null;
			},
			async list() {
				return [...noticeboards.values()];
			}
		},
		notices: {
			async create(input: NewNotice) {
				const notice: Notice = {
					id: newId(),
					...input,
					createdAt: input.createdAt ?? now()
				};
				notices.set(notice.id, notice);
				return notice;
			},
			async findById(id) {
				return notices.get(id) ?? null;
			},
			async listByBoard(boardId) {
				return [...notices.values()]
					.filter((n) => n.boardId === boardId)
					.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
			},
			async findDuplicate({ boardId, title, body, authorId }) {
				for (const notice of notices.values()) {
					if (
						notice.boardId === boardId &&
						notice.title === title &&
						notice.body === body &&
						notice.authorId === authorId
					) {
						return notice;
					}
				}
				return null;
			}
		},
		replies: {
			async create(input: NewReply) {
				const reply: Reply = {
					id: newId(),
					...input,
					createdAt: input.createdAt ?? now()
				};
				replies.set(reply.id, reply);
				return reply;
			},
			async listByNotice(noticeId) {
				return [...replies.values()]
					.filter((r) => r.noticeId === noticeId)
					.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
			}
		},
		trustEvents: {
			async create(input: NewTrustEvent) {
				const event: TrustEvent = { id: newId(), createdAt: now(), ...input };
				trustEvents.set(event.id, event);
				return event;
			},
			async listByUser(userId) {
				return [...trustEvents.values()].filter((e) => e.userId === userId);
			}
		}
	};
}
