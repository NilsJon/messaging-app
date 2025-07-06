import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = { userId: number };

export default function Chat({ userId }: Props) {
    const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
    const [messageText, setMessageText] = useState("");

    const threadsQuery = trpc.getThreads.useQuery({ userId });
    const sendMsg = trpc.sendMessage.useMutation({
        onSuccess() {
            setMessageText("");
            threadsQuery.refetch();
        },
    });

    const createThread = trpc.createThread.useMutation({
        onSuccess(thread) {
            setSelectedThreadId(thread.id);
            threadsQuery.refetch();
        },
        onError(err) {
            alert(err.message);
        },
    });

    const threads = threadsQuery.data;

    const selectedThread = threads?.find(t => t.id === selectedThreadId) ?? null;

    const utils = trpc.useUtils();
    trpc.messageStream.useSubscription(
        { threadId: selectedThread?.id ?? 0 },
        {
            enabled: !!selectedThread,
            onData(msg) {
                utils.getThreads.setData({ userId }, storedThreads =>
                    storedThreads?.map(thread =>
                        thread.id === msg.threadId
                            ? { ...thread, messages: [...thread.messages, msg] }
                            : thread,
                    ),
                );
            },
        },
    );

    if (threadsQuery.isLoading) return <p className="p-4">Loading…</p>;
    if (threadsQuery.isError) return <p className="p-4">Error!</p>;

    return (
        <div className="flex h-screen divide-x">
            <aside className="w-60 overflow-y-auto">
                <div className="p-2">
                    <NewThreadForm createThread={createThread} userId={userId} />
                </div>
                {threads?.map(t => {
                    const lastMsg = t.messages.at(-1);
                    return (
                        <div
                            key={t.id}
                            className={`cursor-pointer p-2 hover:bg-gray-100 ${selectedThreadId === t.id ? "bg-gray-200" : ""}`}
                            onClick={() => setSelectedThreadId(t.id)}
                        >
                            <p className="font-medium">
                                {t.participants
                                    .filter(p => p.userId !== userId)
                                    .map(p => p.user.username)
                                    .join(", ")}
                            </p>
                            {lastMsg && (
                                <p className="truncate text-sm text-gray-500">
                                    {lastMsg.content}
                                </p>
                            )}
                        </div>
                    );
                })}
            </aside>

            {/* Chat view */}
            <section className="flex flex-1 flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {selectedThread?.messages.map(m => (
                        <div
                            key={m.id}
                            className={`max-w-sm rounded p-2 ${
                                m.senderId === userId ? "ml-auto bg-blue-100" : "mr-auto bg-gray-100"
                            }`}
                        >
                            <span className="block text-sm text-gray-600">{"FIXME"}</span>
                            {m.content}
                        </div>
                    ))}
                </div>
                {selectedThread && (
                    <form
                        className="flex gap-2 p-4"
                        onSubmit={e => {
                            e.preventDefault();
                            if (!messageText.trim()) return;
                            sendMsg.mutate({ userId, threadId: selectedThread.id, content: messageText });
                        }}
                    >
                        <Input value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Type…" />
                        <Button type="submit">Send</Button>
                    </form>
                )}
            </section>
        </div>
    );
}

function NewThreadForm({createThread, userId,}: {
    createThread: ReturnType<typeof trpc.createThread.useMutation>;
    userId: number;
}) {
    const [recipientUsername, setRecipientUsername] = useState("");

    return (
        <form
            className="flex gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                const otherUsername = recipientUsername.trim().toLowerCase();
                if (!otherUsername) return;
                createThread.mutate({ userId, otherUsername });
                setRecipientUsername("");
            }}
        >
            <Input
                placeholder="username"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                className="flex-1"
                name="chatRecipient"
                autoComplete="off"
            />
            <Button type="submit">+</Button>
        </form>
    );
}

