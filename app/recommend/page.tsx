'use client';

import { useRef, useState, useEffect } from 'react';
import { Button, Checkbox, Radio, Card, Divider, message, Input } from 'antd';
import { questions } from "@/app/recommend/util";
import SurveyDetailModal from '@/components/SurveyDetailModal';
import {ServerResponse} from '@/utils/type'
import { useSession } from "next-auth/react";

export default function SurveyPage() {
    const { data: session } = useSession();
    const [firstErrorField, setFirstErrorField] = useState<string | null>(null);
    const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [submittedResult, setSubmittedResult] = useState<ServerResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [answers, setAnswers] = useState<Record<string, string[] | string>>({
        q1: [],
        q2: [],
        q3: [],
        q4: '',
        q5: '',
        q6: '',
        q7: '',
        q8: '',
        q9:''
    });

    // 确保ref正确绑定到每个问题容器
    useEffect(() => {
        questions.forEach(question => {
            if (!fieldRefs.current[question.id]) {
                fieldRefs.current[question.id] = document.getElementById(`question-${question.id}`) as HTMLDivElement;
            }
        });

    }, []);

    const handleMultiSelect = (question: string, value: string) => {
        setFirstErrorField(null);
        setAnswers(prev => {
            const current = prev[question] as string[] || [];
            return {
                ...prev,
                [question]: current.includes(value)
                    ? current.filter(v => v !== value)
                    : [...current, value]
            };
        });
    };

    const handleSingleSelect = (question: string, value: string) => {
        setFirstErrorField(null);
        setAnswers(prev => ({
            ...prev,
            [question]: value
        }));
    };

    const handleSubmit = async () => {
        const unansweredQuestions = questions.filter(question => {
            if (question.optional) return false;
            const answer = answers[question.id];
            if (question.type === 'multi') return !answer || (answer as string[]).length === 0;
            return !answer;
        });

        if (unansweredQuestions.length > 0) {
            const firstErrorId = unansweredQuestions[0].id;
            setFirstErrorField(firstErrorId);
            scrollToError(firstErrorId);
            messageApi.info(`请先回答: ${firstErrorId.replace('q', '问题')}`);
            return;
        }

        setLoading(true);
        try {
            // 1. 准备请求体数据
            const requestBody = {
                q1: answers.q1,
                q2: answers.q2,
                q3: answers.q3,
                q4: answers.q4,
                q5: answers.q5,
                q6: answers.q6,
                q7: answers.q7,
                q8: answers.q8,
                q9: answers.q9,
            };

            // 2. 调用 API
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/predict/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${session?.accessToken}`
                },
                body: JSON.stringify(requestBody),
            });

            const serverResponse = await response.json();

            if (serverResponse.code !== 0) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log("serverResponse",serverResponse)

            // 4. 显示结果模态框
            setSubmittedResult(serverResponse.data);

            setShowResultModal(true);

            // 5. 重置表单
            setAnswers({
                q1: [], q2: [], q3: [], q4: '', q5: '', q6: '', q7: '', q8: '',q9:''
            });

            messageApi.success("提交成功");
        } catch (error) {
            console.error('提交失败:', error);
            messageApi.error("提交失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    // 定位滚动和动画逻辑
    const scrollToError = (fieldId: string) => {
        const fieldElement = fieldRefs.current[fieldId];
        const container = containerRef.current;
        if (!fieldElement || !container) return;

        requestAnimationFrame(() => {
            const containerRect = container.getBoundingClientRect();
            const fieldRect = fieldElement.getBoundingClientRect();
            const scrollTop = fieldRect.top - containerRect.top + container.scrollTop - 100;

            container.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        });
    };

    return (
        <div ref={containerRef} className="max-w-4xl mx-auto px-4 py-8 relative h-screen overflow-y-auto">
            <Card title="研究生导师选择问卷" className="mb-8">
                <div className="space-y-8">
                    {questions.map((question) => (
                        <div
                            key={question.id}
                            id={`question-${question.id}`}
                            ref={(el) => { fieldRefs.current[question.id] = el; }}
                            className={`transition-all duration-300 ${
                                firstErrorField === question.id ? 'border-l-4 border-red-500 pl-2 bg-red-50' : 'border-l-2 border-white'
                            }`}
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                {!question.optional && <span className="text-red-500 pr-2">*</span>}
                                {question.title}
                            </h3>

                            {question.type === 'multi' ? (
                                <div className="space-y-2">
                                    {question.options?.map((option) => (
                                        <div key={option.value} className="flex items-center">
                                            <Checkbox
                                                checked={(answers[question.id] as string[] || []).includes(option.value)}
                                                onChange={() => handleMultiSelect(question.id, option.value)}
                                                className="mr-2"
                                            />
                                            <span className="ml-2">{option.label}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : question.type === 'single' ? (
                                <Radio.Group
                                    style={{display: 'flex', flexDirection: 'column', gap: '8px'}}
                                    onChange={(e) => handleSingleSelect(question.id, e.target.value)}
                                    value={answers[question.id] as string}
                                    options={question.options}
                                />
                            ) : (
                                <Input.TextArea
                                    value={answers[question.id] as string || ''}
                                    onChange={(e) => handleSingleSelect(question.id, e.target.value)}
                                    rows={4}
                                    placeholder="请输入您的补充说明..."
                                    className="w-full"
                                />
                            )}
                            <Divider />
                        </div>
                    ))}

                    <div className="flex justify-center">
                        {contextHolder}
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSubmit}
                            loading={loading}
                            className="bg-blue-600 hover:bg-blue-700 submit-button"
                        >
                            提交问卷
                        </Button>
                    </div>
                </div>
            </Card>

            {/* 结果模态框 - 只在提交后显示 */}
            {submittedResult && (
                <SurveyDetailModal
                    visible={showResultModal}
                    onCancel={() => setShowResultModal(false)}
                    data={submittedResult}
                    showChoice={false}
                />
            )}
        </div>
    );
}