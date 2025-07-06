import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { useState } from "react";

export default function App() {
    const [userId, setUserId] = useState<number | null>(() => {
        const v = localStorage.getItem("userId");
        return v ? Number(v) : null;
    });
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login onLogin={(id) => setUserId(id)} />} />
                <Route path="/chat"   element={userId ? <Chat userId={userId} /> : <Navigate to="/login" />}/>
                <Route path="*" element={<Navigate to={userId ? "/chat" : "/login"} />} />
            </Routes>
        </BrowserRouter>
    );
}
