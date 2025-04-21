'use client'
import LeaderList from "@/components/leaderList";
import React, {useState} from "react";
import { Input } from 'antd';
import {usePathname} from "next/navigation";
const { Search } = Input;

export default function Page(){
    const pathname = usePathname()
    const path = pathname.split('/')
    const slug = path[2];
    const page = path[4];

    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(Number(page));

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    return (
        <div className="flex-1 p-8">
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
            <LeaderList tag={slug} currentPage={currentPage} searchText={searchText} onPageChange={setCurrentPage}/>
        </div>
)
}