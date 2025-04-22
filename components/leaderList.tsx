'use client'
import Pagination from "@/components/pagination";
import { LeaderCard } from "@/components/leaderCard";
import { tagMap } from "@/app/tag/util";
import { useState, useEffect } from "react";
import { baseUrl } from "@/utils/constance";
import { useSession } from "next-auth/react";
import { Spin } from 'antd';
import { usePagination } from '@/contexts/PaginationContext';

type TagKey = keyof typeof tagMap;

interface Leader {
    id: string;
    name: string;
    specialty: string;
    mentor_job: string;
    research: string;
    mentor_msg: string;
    image: string;
}

interface LeaderResponse {
    code: number;
    data: {
        records: Leader[];
        total: number;
    };
    message: string;
}

export default function LeaderList({
    tag,
    searchText
}: {
    tag: string;
    searchText: string;
}) {
    const { data: session } = useSession();
    const { currentPage,setCurrentPage } = usePagination();
    const [loading, setLoading] = useState(true);
    const [filteredLeaders, setFilteredLeaders] = useState<Leader[]>([]);
    const [total, setTotal] = useState<number>();

    // 安全地获取中文标签
    const getChineseTag = (tagKey: string): string | null => {
        return tagMap[tagKey as TagKey] || null;
    };

    // 获取导师列表
    const fetchLeaders = async () => {
        try {
            const response = await fetch(`${baseUrl}/mentor/page`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${session?.accessToken}`
                },
                body: JSON.stringify({
                    pageSize: 100,
                    specialty: getChineseTag(tag),
                    message: searchText || undefined,
                }),
            });

            const data: LeaderResponse = await response.json();

            if (data.code === 0) {
                setFilteredLeaders(data.data.records);
                setTotal(data.data.total);
            }
        } catch (error) {
            console.error('获取导师列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 主要数据加载逻辑
    useEffect(() => {
        if (session?.accessToken) {
            setLoading(true);
            fetchLeaders();
        }
    }, [session?.accessToken, currentPage, searchText, tag]);

    // 检测 searchText 变化，如果 currentPage !== 1，则重置为 1
    useEffect(() => {
        if (searchText && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchText, currentPage]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    if (!total || filteredLeaders.length === 0) {
        return (
            <div className="py-6 text-center text-gray-500">
                {tag ? `未找到${getChineseTag(tag) || tag}专业的导师` : '未找到导师'}
            </div>
        );
    }

    // 处理分页参数
    const POSTS_PER_PAGE = 5;
    const totalPages = Math.ceil(total / POSTS_PER_PAGE);

    const slicePosts = filteredLeaders.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        Math.min(currentPage * POSTS_PER_PAGE, filteredLeaders.length)
    );

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 ml-16">
            <div className="grid grid-cols-1 gap-y-4">
                {slicePosts.map((leader) => (
                    <LeaderCard
                        key={leader.id}
                        leader={leader}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                />
            )}
        </div>
    );
}