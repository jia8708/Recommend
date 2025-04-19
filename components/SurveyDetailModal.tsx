'use client';

import { Modal,Divider } from 'antd';
import { questions } from "@/app/recommend/util";
import {LeaderCard} from "@/components/leaderCard";
import React from "react";
import {getLeaders, Leader} from "@/app/leader/util";
import {ServerResponse} from '@/utils/type'

interface SurveyDetailModalProps {
    visible: boolean;
    showChoice: boolean;
    onCancel: () => void;
    data: ServerResponse | null;
}

export default function SurveyDetailModal({ visible, onCancel, data,showChoice }: SurveyDetailModalProps) {
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
                    </div>:null
                }

                <div>
                    <h3 className="text-lg font-semibold mb-4">推荐结果</h3>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 mx-auto w-3/4">
                        <div className="grid grid-cols-1 gap-y-4">
                            {data.result.map((each) => {
                                // 在leaders数组中查找匹配的leader对象
                                const leader = getLeaders().find((l: Leader) => l.name === each.name);

                                // 如果找到匹配的leader则渲染LeaderCard，否则可以渲染null或占位内容
                                return leader ? (
                                    <LeaderCard
                                        key={each.name}
                                        leader={leader}
                                    />
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}