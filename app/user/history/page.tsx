'use client';

import { useEffect, useState } from 'react';
import { Card, Table, Button, message } from 'antd';
import SurveyDetailModal from '@/components/SurveyDetailModal';
import { ServerResponse ,Subjective} from '@/utils/type';
import { baseUrl } from '@/utils/constance';
import { useSession } from "next-auth/react";

export default function HistoryPage() {
    const { data: session } = useSession();
    const [results, setResults] = useState<ServerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<ServerResponse | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            setLoading(true);
            // 从后端接口获取历史记录
            const response = await fetch(`${baseUrl}/predict/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${session?.accessToken}`
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 0) {
                // 假设后端返回的数据结构为 { code: 0, data: SurveyResult }
                setResults(data.data);
            } else {
                throw new Error(data.message || '获取历史记录失败');
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            message.error('加载历史记录失败');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '提交时间',
            dataIndex: 'subjective', // 修改为 subjective
            key: 'createTime',
            render: (subjective: Subjective) => {
                return subjective?.createTime ? new Date(subjective.createTime).toLocaleString() : '无时间';
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: ServerResponse) => (
                <Button type="link" onClick={() => viewDetails(record)}>
                    查看详情
                </Button>
            ),
        },
    ];

    const viewDetails = (record: ServerResponse) => {
        setSelectedResult(record);
        setModalVisible(true);
    };

    return (
        <div className="max-w-6xl mx-auto py-8 w-full">
            <Card
                title="历史问卷结果"
                loading={loading}
                extra={<Button type="default" onClick={loadResults}>刷新</Button>}
            >
                <Table
                    columns={columns}
                    dataSource={results}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <SurveyDetailModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                data={selectedResult}
                showChoice={true}
            />
        </div>
    );
}