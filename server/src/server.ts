import express from 'express';
import {createExpressMiddleware} from '@trpc/server/adapters/express';
import {initTRPC, TRPCError} from '@trpc/server';
import cors from 'cors';
import {PrismaClient} from '@prisma/client';
import {z} from 'zod';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { on } from 'events';
import {eventEmitter, publishNewMessage} from "./EventEmitter";


const prisma = new PrismaClient();
const t = initTRPC.create();

export const appRouter = t.router({
    // login user
    login: t.procedure
        .input(z.object({
            username: z.string(),
            password: z.string(),
        }))
        .mutation(async ({ input }) => {
            const user = await prisma.user.findUnique({
                where: { username: input.username },
            });
            if (!user || user.password !== input.password) {
                throw new Error('Invalid credentials');
            }
            return { id: user.id, username: user.username };
        }),

    // 1. Get all threads for a user
    getThreads: t.procedure
        .input(z.object({ userId: z.number() }))
        .query(({ input }) =>
            prisma.thread.findMany({
                where: {
                    participants: { some: { userId: input.userId } },
                },
                include: {
                    participants: { include: { user: true } },
                    messages: { orderBy: { createdAt: 'asc' } },
                },
            }),
        ),

    // 2. Create (or return existing) DM thread
    createThread: t.procedure
        .input(
            z.object({
                userId: z.number(),
                otherUsername: z.string().min(1),
            }),
        )
        .mutation(async ({ input }) => {
            const otherUser = await prisma.user.findUnique({
                where: { username: input.otherUsername },
            });
            if (!otherUser) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'User not found',
                });
            }
            if (otherUser.id === input.userId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot chat with yourself',
                });
            }
            // 1️⃣ check if it already exists
            const existing = await prisma.thread.findFirst({
                where: {
                    participants: {
                        every: { userId: { in: [input.userId, otherUser.id] } },
                    },
                },
                include: { participants: true },
            });
            if (existing) return existing;

            return prisma.thread.create({
                data: {
                    participants: {
                        create: [
                            { userId: input.userId },
                            { userId: otherUser.id },
                        ],
                    },
                },
                include: { participants: true },
            });
        }),

    // 3. Send a message
    sendMessage: t.procedure
        .input(
            z.object({
                userId: z.number(),
                threadId: z.number(),
                content: z.string().min(1),
            }),
        )
        .mutation(async ({ input }) => {
            const message = await prisma.message.create({
                data: {
                    threadId: input.threadId,
                    content: input.content,
                    senderId: input.userId,
                },
                include: {sender: true},
            });
            publishNewMessage(message);
            return message
        }),

    messageStream: t.procedure
        .input(z.object({ threadId: z.number() }))
        .subscription(({ input }) => {
            const rawIter = on(eventEmitter, 'new-message') as AsyncIterableIterator<[Awaited<ReturnType<typeof prisma.message.create>>]>;

            return (async function* () {
                for await (const [msg] of rawIter) {
                    // TS will treat `msg` as `any`, but you know it's a Message
                    if (msg.threadId === input.threadId) {
                        yield msg;
                    }
                }
            })();
        }),

});


export type AppRouter = typeof appRouter;

const app = express();
app.use(cors());
app.use(
    '/trpc',
    createExpressMiddleware({
        router: appRouter,
    }),
);

const httpServer = app.listen(4000, () => {
    console.log('Server ready at http://localhost:4000/trpc');
});


const wss = new WebSocketServer({ server: httpServer });
applyWSSHandler({
    wss,
    router: appRouter,
    createContext: () => ({}),
});
