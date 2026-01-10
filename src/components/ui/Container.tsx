import React from "react";

export function Container({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
            (children)
        </div>
    );
}