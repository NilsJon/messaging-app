import { useState } from "react";
import { trpc } from "../lib/trpc";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login({ onLogin }: { onLogin: (id: number) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const login = trpc.login.useMutation({
        onSuccess(data) {
            localStorage.setItem("userId", String(data.id));
            onLogin(data.id);
            navigate("/chat");
        },
        onError: (err) => alert(err.message),
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col gap-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            login.mutate({ username, password });
                        }}
                    >
                        <div className="grid gap-3">
                            <Label>Username</Label>
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="grid gap-3">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit">Login</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

