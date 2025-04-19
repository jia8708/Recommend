import React from "react";
import MessageTabs from "@/components/MessageTabs";

export default function LeaderLayout({children}: {
    children: React.ReactNode
}) {

    return (
        <div className="flex flex-col min-h-screen">
            <div>
                <h1 className="text-2xl font-bold mb-6 text-center">消息中心</h1>
                <MessageTabs/>
            </div>

            <main>
                {children}
            </main>
        </div>
    )
}