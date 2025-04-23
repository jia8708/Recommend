'use client'
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState, useEffect, useCallback } from "react";
import { User } from "@/app/leader/[slug]/forum/util";
import { message } from 'antd';
import { useSession } from "next-auth/react";

interface CommentMessage {
    id: string;
    content: string;
    postId: string;
    userId:number;
    createTime:string;
    updateTime:string;
    mentorId:string;
}

interface PostRecord {
    id: string;
    mentorId:string;
    commentsVOS: CommentMessage[];
}

interface ApiResponse {
    code: number;
    message: string;
    data: {
        records: PostRecord[];
    };
}

export default function CommentMessages() {
    const { data: session } = useSession();
    const [usersMap, setUsersMap] = useState<Record<number, User>>({});
    const [messages, setMessages] = useState<CommentMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

    // 获取用户发送的帖子列表（包含评论）
    const getCommentMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/post/my/list/page/vo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${session?.accessToken}`
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.code !== 0) {
                throw new Error(data.message || '获取帖子列表失败');
            }

            const allComments = data.data.records.flatMap(record =>
                record.commentsVOS.map(comment => ({
                    ...comment,
                    postId: record.id,
                    mentorId:record.mentorId
                }))
            );

            setMessages(allComments.sort((a, b) =>
                new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
            ));
        } catch (error) {
            console.error('加载评论失败:', error);
            messageApi.error('加载评论失败');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [session?.accessToken, messageApi]);

    useEffect(() => {
        getCommentMessages();
    }, [getCommentMessages]);

    //获取用户信息
    const userInfo = useCallback(async (userID: number): Promise<User | null> => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/user/get/vo/?id=${userID}`, {
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

    //加载用户信息
    const loadUserInfo = useCallback(async (userId: number) => {
        if (usersMap[userId]) return;
        const user = await userInfo(userId);
        if (user) {
            setUsersMap(prev => ({ ...prev, [userId]: user }));
        }
    }, [userInfo, usersMap]);

    //加载已评论的用户信息
    useEffect(() => {
        if (messages.length > 0) {
            messages.forEach(comment => {
                loadUserInfo(comment.userId);
            });
        }
    }, [messages, loadUserInfo]);

    if (loading) {
        return (
            <div className="mt-4 text-center">
                {contextHolder}
                <p className="text-gray-500">加载中...</p>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="mt-4">
                {contextHolder}
                <p className="text-gray-500 text-center">暂无评论消息</p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            {contextHolder}
            <ul className="divide-y divide-gray-200">
                {messages.map((message) => {
                    const user = usersMap[message.userId];
                    return (
                        <li key={message.id} className="py-4">
                            <Link
                                key={message.id}
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
                                            {user?.userName || '未知用户'} 回复了你
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