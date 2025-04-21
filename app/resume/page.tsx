'use client'
import React, {useEffect, useState} from 'react';
import { Upload, Button, message, Spin, Card, Tag, Switch } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadChangeParam } from 'antd/es/upload/interface';
import { baseUrl } from '@/utils/constance';
import { useSession } from 'next-auth/react';

interface InterviewQuestion {
    question_id: number;
    question: string;
    answer: string;
    keywords: string[];
}

interface ResumeInfo {
    教育背景: Array<{
        学校: string;
        专业: string;
        学历: string;
        学术荣誉: string[];
        'GPA/排名'?: string | null;
        核心课程?: string[] | null;
    }>;
    兴趣爱好: {
        学术相关?: string[] | null;
        文体活动?: string[] | null;
        特长?: string[] | null;
        获得证书: string[];
    };
    校园生活: {
        学生组织: Array<{
            名称: string;
            职务: string;
            持续时间: string;
        }>;
        志愿服务?: string[] | null;
        校园活动?: string[] | null;
    };
    科研项目: Array<{
        项目名称: string;
        担任角色: string | null;
        项目成果: string;
        个人贡献?: string | null;
        关键技术?: string | null;
        时间段?: string | null;
    }>;
    自我评价: {
        个人优势?: string | null;
        个性特点?: string | null;
        发展目标: string;
        学术能力?: string | null;
    };
}

interface ResumeAnalysisResponse {
    status: string;
    interview_questions: string;
    resume_info: ResumeInfo;
    message?: string;
}

export default function ResumePage() {
    const { data: session } = useSession();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [analysisResults, setAnalysisResults] = useState<InterviewQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [isLocalMode, setIsLocalMode] = useState(false);

    useEffect(() => {
        handleModeChange(false);
    }, []);

    const parseInterviewQuestions = (jsonString: string): InterviewQuestion[] => {
        try {
            // 将所有JSON对象提取出来
            const matches = jsonString.match(/\{[^}]+\}/g) || [];
            return matches.map(match => JSON.parse(match));
        } catch (error) {
            console.error('解析面试问题失败:', error);
            return [];
        }
    };

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

            const response = await fetch(`${baseUrl}/file/upload`, {
                method: 'POST',
                headers: {
                    'token': `${session?.accessToken}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ResumeAnalysisResponse = await response.json();

            if (data.status === 'success') {
                const questions = parseInterviewQuestions(data.interview_questions);
                setAnalysisResults(questions);
                messageApi.success('分析完成');
            } else {
                throw new Error(data.message || '上传失败');
            }
        } catch (error) {
            console.error('上传失败:', error);
            messageApi.error(`上传失败，请重试`);
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

    // 切换模式
    const handleModeChange = async (checked: boolean) => {
        try {
            const response = await fetch(`${baseUrl}/file/mode?mode=${checked ? 1 : 0}`, {
                method: 'PUT',
                headers: {
                    'token': `${session?.accessToken}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setIsLocalMode(checked);
                messageApi.success(`已切换到${checked ? '本地' : 'API'}模式`);
            } else {
                throw new Error(data.message || '切换模式失败');
            }
        } catch (error) {
            messageApi.error('切换模式失败，请重试');
            console.error(error);
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
                {session?.user?.role === 'admin' && (
                    <div className="mt-4 flex items-center justify-center space-x-2">
                        <span>选择模式</span>
                        <Switch
                            checked={isLocalMode}
                            onChange={handleModeChange}
                            checkedChildren="本地"
                            unCheckedChildren="API"
                        />
                    </div>
                )}
            </div>

            <Spin spinning={loading} tip="简历分析中，请稍候...">
                <div className="space-y-4">
                    {analysisResults.map((item) => (
                        <Card key={item.question_id} className="w-full">
                            <div className="space-y-4">
                                <div className="font-bold text-lg">
                                    问题 {item.question_id}：{item.question}
                                </div>
                                <div className="text-gray-700">
                                    {item.answer}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {item.keywords.map((keyword, index) => (
                                        <Tag key={index} color="blue">{keyword}</Tag>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Spin>
        </div>
    );
}