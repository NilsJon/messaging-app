import { createWSClient, wsLink, httpBatchLink, splitLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/src/server';

export const trpc = createTRPCReact<AppRouter>();

const wsClient = createWSClient({ url: 'ws://localhost:4000/trpc' });

export const trpcClient = trpc.createClient({
    links: [
        splitLink({
            condition: (op) => op.type === 'subscription',
            true: wsLink({ client: wsClient }),
            false: httpBatchLink({ url: 'http://localhost:4000/trpc' }),
        }),
    ],
});
