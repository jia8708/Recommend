'use client'
import {usePathname} from 'next/navigation'
import React from "react";
import LeaderSidebar from "@/components/leaderSidebar";

export default function LeaderLayout({children}: {
    children: React.ReactNode
}) {

    const pathname = usePathname()
    const path = pathname.split('/')
    const slug = path[2];

    console.log(1111,slug)

    return (
        <div className="flex min-h-screen">
            {/* 左侧固定侧边栏 */}
            <aside className="w-64 p-4 overflow-y-auto bg-zinc-50 rounded-sm dark:bg-gray-900">
                <LeaderSidebar slug={slug}/>
            </aside>

            {/* 右侧动态内容区 */}
            <main className="flex flex-col p-8 w-2/3">
                {children}
            </main>
        </div>
    )
}