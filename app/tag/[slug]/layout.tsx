import Sidebar from "@/components/sidebar";
import {getTags} from "@/app/tag/util";
import React from "react";

export default async function TagLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            {/* 左侧固定侧边栏 */}
            <aside className="w-64 p-4 overflow-y-auto bg-zinc-50 rounded-sm dark:bg-gray-900">
                <Sidebar tags={getTags()} />
            </aside>

            {/* 右侧动态内容区 */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}