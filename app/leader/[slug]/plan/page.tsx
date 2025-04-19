'use client';

import { Card, Empty, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import {usePathname} from 'next/navigation';
import { getLeaderInfo } from '../../util';
import { LeaderInfo } from '../../util';

export default function PlanPage() {
    const pathname = usePathname()
    const path = pathname.split('/')
    const slug = path[2];

    const [leader, setLeader] = useState<LeaderInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getLeaderInfo(slug);
                setLeader(data);
            } catch (error) {
                messageApi.error('获取招生计划信息失败');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, messageApi]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!leader || !leader.employment) {
        return (
            <div className="max-w-4xl mx-auto p-6 w-full">
                <Card title="招生计划" className="shadow-md">
                    <Empty
                        description="暂无招生计划信息"
                        className="py-8"
                    />
                </Card>
            </div>
        );
    }

    // 将就业方向按分号或逗号分割成数组
    const employmentAreas = leader.employment.split(/[；，]/).filter(Boolean);

    return (
        <div className="max-w-4xl mx-auto p-6 w-full">
            {contextHolder}
            <Card title="招生计划" className="shadow-md">
                <ul className="list-disc pl-6 space-y-4">
                    {employmentAreas.map((area, index) => (
                        <li key={index} className="text-md text-gray-700">
                            {area}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}