'use client'
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { message, Spin } from 'antd';
import { useSession } from "next-auth/react";
import { User } from "@/app/leader/[slug]/forum/util";

interface ThumbMessage {
    postId: string;
    commentsId: string;
    content: string;
    createTime: string;
    thumb_userId: string;
    mentorId: string;
}

export default function LikeMessages() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<ThumbMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersMap, setUsersMap] = useState<Record<string, User>>({});
    const [messageApi, contextHolder] = message.useMessage();

    // 获取点赞列表
    const getThumbMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/comments_thumb/thumbList`, {
                method: 'GET',
                headers: {
                    'token': `${session?.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 0) {
                setMessages(data.data.sort((a: ThumbMessage, b: ThumbMessage) =>
                    new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
                ));
            } else {
                throw new Error(data.message || '获取点赞列表失败');
            }
        } catch (error) {
            console.error('加载点赞失败:', error);
            messageApi.error('加载点赞失败');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken, messageApi]);

    // 获取用户信息
    const userInfo = useCallback(async (userId: string): Promise<User | null> => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/user/get/vo/?id=${userId}`, {
                method: 'GET',
                headers: {
                    'token': `${session?.accessToken}`,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();

            if (data.code === 0) {
                return data.data;
            } else {
                messageApi.error('用户不存在');
                return null;
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
            return null;
        }
    }, [session?.accessToken, messageApi]);

    // 加载用户信息
    const loadUserInfo = useCallback(async (userId: string) => {
        if (usersMap[userId]) return;
        const user = await userInfo(userId);
        if (user) {
            setUsersMap(prev => ({ ...prev, [userId]: user }));
        }
    }, [userInfo, usersMap]);

    // 初始加载点赞列表
    useEffect(() => {
        getThumbMessages();
    }, [getThumbMessages]);

    // 加载点赞用户信息
    useEffect(() => {
        if (messages.length > 0) {
            messages.forEach(message => {
                loadUserInfo(message.thumb_userId);
            });
        }
    }, [messages, loadUserInfo]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                {contextHolder}
                <Spin size="large" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="mt-4">
                {contextHolder}
                <p className="text-gray-500 text-center">暂无点赞消息</p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            {contextHolder}
            <ul className="divide-y divide-gray-200">
                {messages.map((message) => {
                    const user = usersMap[message.thumb_userId];
                    return (
                        <li key={message.commentsId} className="py-4">
                            <Link
                                href={`/leader/${message.mentorId}/forum/${message.postId}`}
                                className="block hover:bg-gray-50 p-2 rounded"
                            >
                                <div className="flex items-center">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src={user?.userAvatar ? (
                                            user.userAvatar.startsWith('/9j/') 
                                                ? `data:image/jpeg;base64,${user.userAvatar}`
                                                : user.userAvatar
                                        ) : '/img/people.png'}
                                        alt={user?.userName || '用户头像'}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/img/people.png';
                                        }}
                                    />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.userName || '未知用户'} 点赞了你的评论
                                        </p>
                                        <p className="text-sm text-gray-500 truncate max-w-md">
                                            {message.content}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDistanceToNow(new Date(message.createTime), {
                                                addSuffix: true,
                                                locale: zhCN
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}