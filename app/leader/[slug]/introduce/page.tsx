'use client'
import { Card, Descriptions, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { getLeaderInfo } from '../../util';
import { LeaderInfo } from '../../util';
import {usePathname} from "next/navigation";

export default function IntroducePage() {
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
                messageApi.error('获取导师信息失败');
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

    if (!leader) {
        return <div className="text-center text-gray-500 mt-8 w-full">暂无导师信息</div>;
    }

    // 解析导师信息
    const mentorInfo = leader.mentor_msg.split('\n\n').reduce((acc: Record<string, string>, item: string) => {
        const [key, value] = item.split('：');
        if (key && value) {
            acc[key.trim()] = value.trim();
        }
        return acc;
    }, {});

    return (
        <div className="max-w-4xl mx-auto w-full p-6">
            {contextHolder}
            <Card title="导师介绍" className="shadow-md">
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="姓名">{leader.name}</Descriptions.Item>
                    <Descriptions.Item label="职称">{leader.mentor_job || '暂无信息'}</Descriptions.Item>
                    <Descriptions.Item label="专业方向">{leader.specialty}</Descriptions.Item>
                    {Object.entries(mentorInfo).map(([key, value]) => (
                        <Descriptions.Item key={key} label={key}>
                            {value}
                        </Descriptions.Item>
                    ))}
                </Descriptions>
            </Card>
        </div>
    );
}