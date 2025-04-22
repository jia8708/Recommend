'use client'
import { Card, List, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { getLeaderInfo } from '../../util';
import { LeaderInfo } from '../../util';
import { usePathname } from "next/navigation";

export default function ProjectPage() {
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
                messageApi.error('获取项目信息失败');
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

    if (!leader || !leader.projects || leader.projects.length === 0) {
        return <div className="text-center text-gray-500 mt-8 w-full">暂无项目信息</div>;
    }

    return (
        <div className="max-w-4xl mx-auto w-full  p-6">
            {contextHolder}
            <Card title="项目经历" className="shadow-md w-full">
                <List
                    itemLayout="vertical"
                    dataSource={leader.projects}
                    renderItem={(item, index) => (
                        <List.Item>
                            <div className="flex items-start">
                                <span className="text-lg font-medium mr-4 text-gray-400">
                                    {(index + 1).toString().padStart(2, '0')}
                                </span>
                                <div className="flex-1">
                                    <h3 className="text-md text-gray-800">
                                        {item.project}
                                    </h3>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
}