'use client'
import { Modal, Divider, Spin } from 'antd';
import { questions } from "@/app/recommend/util";
import { LeaderCard } from "@/components/leaderCard";
import React, { useState, useEffect } from "react";
import { Leader } from "@/app/leader/util";
import { ServerResponse } from '@/utils/type';
import { useSession } from "next-auth/react";

interface SurveyDetailModalProps {
    visible: boolean;
    showChoice: boolean;
    onCancel: () => void;
    data: ServerResponse | null;
}

export default function SurveyDetailModal({ visible, onCancel, data, showChoice }: SurveyDetailModalProps) {
    const { data: session } = useSession();
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data?.result && visible) {
            fetchLeaders();
        }
    }, [data, visible]);

    const fetchLeaders = async () => {
        if (!data?.result) return;
        setLoading(true);
        try {
            // 使用 Promise.all 并行获取所有导师信息
            const leaderPromises = data.result.map(async (each) => {
                const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/mentor/page`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': `${session?.accessToken}`
                    },
                    body: JSON.stringify({
                        message: each.name
                    })
                });
                const result = await response.json();
                if (result.code === 0 && result.data.records.length > 0) {
                    return result.data.records[0];
                }
                return null;
            });

            const results = await Promise.all(leaderPromises);
            setLeaders(results.filter((leader): leader is Leader => leader !== null));
        } catch (error) {
            console.error('获取导师信息失败:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!data) return null;

    //获取用户每个问题回答的answer,回答格式为q1:...
    const getAnswerText = (questionId: string) => {
        //找到问题
        const question = questions.find(q => q.id === questionId);
        if (!question) return '';

        //找到用户回答
        let answer;
        switch (questionId) {
            case 'q1':
                answer = data.subjective.q1;
                break;
            case 'q2':
                answer = data.subjective.q2;
                break;
            case 'q3':
                answer = data.subjective.q3;
                break;
            case 'q4':
                answer = data.subjective.q4;
                break;
            case 'q5':
                answer = data.subjective.q5;
                break;
            case 'q6':
                answer = data.subjective.q6;
                break;
            case 'q7':
                answer = data.subjective.q7;
                break;
            case 'q8':
                answer = data.subjective.q8;
                break;
            case 'q9':
                answer = data.subjective.q9;
                break;
        }

        if (!answer) return '未回答';

        if (Array.isArray(answer)) {
            return answer.map(val => {
                const option = question.options?.find(opt => opt.value === val);
                return option ? option.label : val;
            }).join(', ');
        } else {
            const option = question.options?.find(opt => opt.value === answer);
            return option ? option.label : answer;
        }
    };

    return (
        <Modal
            title="问卷详情"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <div className="space-y-6">
                {showChoice ?
                    <div>
                        <h3 className="text-lg font-semibold mb-4">您的选择</h3>
                        {questions.map(question => (
                            <div key={question.id} className="mb-4">
                                <p className="font-medium">{question.title}</p>
                                <p className="text-gray-600">{getAnswerText(question.id)}</p>
                                <Divider className="my-2"/>
                            </div>
                        ))}
                    </div> : null
                }

                <div>
                    <h3 className="text-lg font-semibold mb-4">推荐结果</h3>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 mx-auto w-3/4">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Spin />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-y-4">
                                {leaders.map((leader) => (
                                    <LeaderCard
                                        key={leader.id}
                                        leader={leader}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}