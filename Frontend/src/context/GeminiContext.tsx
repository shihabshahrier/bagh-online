/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { assistWithBagh } from "../lib/api";

interface GeminiContextType {
    message: string;
    isLoading: boolean;
    error: string | null;
    ask: (prompt: string, code?: string) => Promise<void>;
    reset: () => void;
}

const GeminiContext = createContext<GeminiContextType | null>(null);

export function GeminiProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState("কোড লিখে চালাও, আমি পাশে আছি!");
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: ({ prompt, code }: { prompt: string; code?: string }) =>
            assistWithBagh(prompt, code),
        onSuccess: (data) => {
            setMessage(data.message);
            setError(null);
        },
        onError: (err: unknown) => {
            const errorMsg =
                err instanceof Error ? err.message : "Gemini এ একটি সমস্যা হয়েছে।";
            setError(errorMsg);
            setMessage("");
        },
    });

    const ask = useCallback(
        async (prompt: string, code?: string) => {
            setError(null);
            setMessage("");
            await mutation.mutateAsync({ prompt, code });
        },
        [mutation]
    );

    const reset = useCallback(() => {
        setMessage("কোড লিখে চালাও, আমি পাশে আছি!");
        setError(null);
    }, []);

    const value: GeminiContextType = {
        message,
        isLoading: mutation.isPending,
        error,
        ask,
        reset,
    };

    return (
        <GeminiContext.Provider value={value}>{children}</GeminiContext.Provider>
    );
}

export function useGemini() {
    const context = useContext(GeminiContext);
    if (!context) {
        throw new Error("useGemini must be used within GeminiProvider");
    }
    return context;
}
