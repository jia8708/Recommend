'use client'
import LeaderList from "@/components/leaderList";
import React from "react";
import { Input } from 'antd';
import { usePathname } from "next/navigation";
import { usePagination } from '@/contexts/PaginationContext';
const { Search } = Input;

export default function Page() {
    const pathname = usePathname()
    const path = pathname.split('/')
    const slug = path[2];
    const { searchText,setSearchText } = usePagination();

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    return (
        <div>
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
            <LeaderList tag={slug} searchText={searchText}/>
        </div>
    );
}