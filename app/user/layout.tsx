import React from "react";
import UserSidebar from "@/components/userSidebar";

export default function LeaderLayout({children}: {
    children: React.ReactNode
}) {

    return (
        <div className="flex min-h-screen">
            {/* 左侧固定侧边栏 */}
            <aside className="w-64 p-4 overflow-y-auto bg-zinc-50 rounded-sm dark:bg-gray-900">
                <UserSidebar />
            </aside>

            {/* 右侧动态内容区 */}
            <main className="flex flex-col p-8 w-2/3">
                {children}
            </main>
        </div>
    )
}