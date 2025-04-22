'use client'
import LeaderList from '@/components/leaderList'
import Sidebar from "@/components/sidebar";
import React from "react";
import { getTags } from "@/app/tag/util";
import { Input } from 'antd';
import {usePagination} from "@/contexts/PaginationContext";
const { Search } = Input;

export default function Page() {
    const {searchText, setSearchText } = usePagination();

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    return (
        <section>
            <div className="flex min-h-screen">
                {/* 左侧固定侧边栏 */}
                <aside className="w-64 p-4 overflow-y-auto bg-zinc-50 rounded-sm dark:bg-gray-900">
                    <Sidebar tags={getTags()} />
                </aside>

                {/* 右侧动态内容区 */}
                <main className="flex-1 p-8">
                    <div className="mb-6 ml-auto w-2/3">
                        <Search
                            placeholder="搜索导师"
                            allowClear
                            enterButton="搜索"
                            size="large"
                            onSearch={handleSearch}
                            className="max-w-xl"
                        />
                    </div>
                    <LeaderList tag='' searchText={searchText} />
                </main>
            </div>
        </section>
    )
}
