'use client'
import { LeaderCard } from "@/components/leaderCard";
import { tagMap } from "@/app/tag/util";
import { useEffect, useState } from 'react';
import { baseUrl } from '@/utils/constance';
import { useSession } from 'next-auth/react';
import { Spin } from 'antd';
import Pagination from "@/components/pagination";

// 添加类型定义
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
        size: number;
        current: number;
    };
    message: string;
}

export default function LeaderList({tag, currentPage, searchText}: {
    tag: string;
    currentPage: number;
    searchText: string;
}) {
    const { data: session } = useSession();
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const pageSize = 5;

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
                    current: currentPage,
                    pageSize: pageSize,
                    message: searchText || undefined
                })
            });

            const data: LeaderResponse = await response.json();

            if (data.code === 0) {
                let filteredLeaders = data.data.records;
                console.log("leaderlistdata", filteredLeaders,tag);

                // 如果有标签筛选，在客户端进行过滤
                if (tag) {
                    const chineseTag = tagMap[tag as TagKey];
                    if (chineseTag) {
                        filteredLeaders = filteredLeaders.filter(
                            leader => leader.specialty === chineseTag
                        );
                    }
                }

                setLeaders(filteredLeaders);
                setTotal(data.data.total);
            }
        } catch (error) {
            console.error('获取导师列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.accessToken) {
            setLoading(true);
            fetchLeaders();
        }
    }, [session?.accessToken, currentPage, searchText, tag]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700 ml-16">
            <div className="grid grid-cols-1 gap-y-4">
                {!leaders.length && (
                    <div className="py-6 text-center text-gray-500">
                        {tag ? `未找到${tagMap[tag as TagKey] || tag}专业的导师` : '未找到导师'}
                    </div>
                )}

                {leaders.map((leader) => (
                    <LeaderCard
                        key={leader.id}
                        leader={leader}
                    />
                ))}
            </div>

            {total > pageSize && (
                <div className="py-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(total / pageSize)}
                    />
                </div>
            )}
        </div>
    );
}