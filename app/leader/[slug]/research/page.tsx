'use client'
import { Card, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { getLeaderInfo } from '../../util';
import { LeaderInfo } from '../../util';
import {usePathname} from "next/navigation";

export default function ResearchPage() {
    const [leader, setLeader] = useState<LeaderInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    const pathname = usePathname()
    const path = pathname.split('/')
    const slug = path[2];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getLeaderInfo(slug);
                setLeader(data);
            } catch (error) {
                messageApi.error('获取研究方向信息失败');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, messageApi]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <Spin size="large" />
        </div>;
    }

    if (!leader || !leader.research) {
        return <div className="text-center text-gray-500 mt-8 w-full">暂无研究方向信息</div>;
    }

    // 将研究方向按逗号分割成数组
    const researchAreas = leader.research.split('，').filter(Boolean);

    return (
        <div className="max-w-4xl mx-auto p-6 w-full">
            {contextHolder}
            <Card title="研究方向" className="shadow-md">
                <ul className="list-disc pl-6 space-y-4">
                    {researchAreas.map((area, index) => (
                        <li key={index} className="text-md text-gray-700">
                            {area}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}