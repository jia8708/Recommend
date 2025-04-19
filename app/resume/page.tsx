'use client'
import React, { useState } from 'react';
import { Upload, Button, Table, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadChangeParam } from 'antd/es/upload/interface';
import { baseUrl } from '@/utils/constance';
import { useSession } from 'next-auth/react';

interface ResumeAnalysis {
    question: string;
    answer: string;
}

export default function ResumePage() {
    const { data: session } = useSession();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [analysisResults, setAnalysisResults] = useState<ResumeAnalysis[]>([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const columns = [
        {
            title: '问题',
            dataIndex: 'question',
            key: 'question',
            width: '40%',
        },
        {
            title: '分析结果',
            dataIndex: 'answer',
            key: 'answer',
            width: '60%',
        },
    ];

    const handleUpload = async () => {
        if (fileList.length === 0) {
            messageApi.warning('请先选择PDF文件');
            return;
        }

        const file = fileList[0].originFileObj;
        if (!file) {
            messageApi.error('文件获取失败');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // 验证 FormData 内容
            console.log("FormData 内容:");
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await fetch(`${baseUrl}/file/upload`, {
                method: 'POST',
                headers: {
                    'token': `${session?.accessToken}`
                },
                body: formData
            });

            // 检查响应状态
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("服务器响应:", data);

            if (data.code === 0) {
                setAnalysisResults(data.data);
                messageApi.success('分析完成');
            } else {
                throw new Error(data.message || '上传失败');
            }
        } catch (error) {
            console.error('上传失败:', error);
            messageApi.error(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        accept: '.pdf',
        maxCount: 1,
        fileList: fileList,
        beforeUpload: (file: File) => {
            if (file.type !== 'application/pdf') {
                messageApi.error('只能上传PDF文件！');
                return false;
            }
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                messageApi.error('文件大小不能超过10MB！');
                return false;
            }
            return false;
        },
        onChange: ({ fileList }: UploadChangeParam) => {
            setFileList(fileList);
            setAnalysisResults([]);
        },
        onRemove: () => {
            setFileList([]);
            setAnalysisResults([]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {contextHolder}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-8">简历分析</h1>
                <div className="flex justify-center space-x-4">
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>选择PDF文件</Button>
                    </Upload>
                    {fileList.length === 0 && <div className="w-6" />}
                    <Button
                        type="primary"
                        onClick={handleUpload}
                        disabled={fileList.length === 0}
                        loading={loading}
                        className="bg-[#f38181] hover:bg-[#e66767]"
                    >
                        开始分析
                    </Button>
                </div>
            </div>

            <Spin spinning={loading}>
                {analysisResults.length > 0 && (
                    <Table
                        columns={columns}
                        dataSource={analysisResults}
                        rowKey={(_record, index) => (index || 0).toString()}
                        pagination={false}
                        className="mt-4"
                    />
                )}
            </Spin>
        </div>
    );
}