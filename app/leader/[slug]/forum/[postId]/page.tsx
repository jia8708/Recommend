'use client'
import { Card, Button, message, Popconfirm, Modal, Form, Input } from 'antd';
import { LikeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Post,User,Comment } from "@/app/leader/[slug]/forum/util";
import { baseUrl } from "@/utils/constance";
import {formatDate} from "@/utils/util";
import {usePathname} from "next/navigation";
import { useSession } from "next-auth/react";

export default function PostDetailPage() {
    const params = usePathname().split('/');
    const postId = params[params.length - 1];

    //new comments
    const [commentText, setCommentText] = useState('');
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();

    //posts
    const [post,setPost] = useState<Post|null>(null)

    //user
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [usersMap, setUsersMap] = useState<Record<number, User>>({});

    const [messageApi, contextHolder] = message.useMessage();

    //token
    const { data: session } = useSession();
    const token = session?.accessToken


    //获取当前用户信息
    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`${baseUrl}/user/get/login`, {
                headers: {
                    'token': `${token}`,
                },
            });
            const data = await response.json();
            console.log("loginUser",data)

            if (data.code === 0) {
                setCurrentUser(data.data);
            } else {
                messageApi.error(data.message || '获取用户信息失败');
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
        }
    };

    //获取所有帖子
    const fetchPosts = async () => {
        try {
            const response = await fetch(`${baseUrl}/post/list/page/vo`, {
                method: 'POST',
                headers: {
                    'token': `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            const data = await response.json();

            if (data.code === 0) {
                setPost(data.data.records.find((post:Post) => String(post.id) === postId))
                console.log("post",data.data.records.find((post:Post) => String(post.id) === postId))
            } else {
                messageApi.error(data.message || '获取帖子列表失败');
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
        }
    };

    //加载用户信息
    const loadUserInfo = async (userId: number) => {
        if (usersMap[userId]) return; // 已加载过
        const user = await userInfo(userId);
        if (user) {
            setUsersMap(prev => ({ ...prev, [userId]: user }));
        }
    };

    //获取用户信息
    const userInfo = async (userID:number):Promise<User | null> => {
        try {
            const response = await fetch(`${baseUrl}/user/get/vo/?id=${userID}`, {
                method: 'GET',
                headers: {
                    'token': `${token}`,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log("userInfo",data)

            if (data.code === 0) {
                return data.data;
            } else {
                console.error('用户不存在');
                return null;
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
            return null;
        }
    };

    //初始加载：当前用户和所有帖子
    useEffect(() => {
        fetchCurrentUser();
        fetchPosts();
    }, []);

    //加载已评论的用户信息
    useEffect(() => {
        if (post?.commentsVOS) {
            post.commentsVOS.forEach(comment => {
                loadUserInfo(comment.userId);
            });
        }
    }, [post]);

    if (!post) {
        return <div className="text-center text-gray-600">帖子不存在</div>;
    }

    //评论提交
    const handleCommentSubmit = async () => {
        if (!commentText.trim()) {
            messageApi.warning('请输入评论内容');
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/comments/add`, {
                method: 'POST',
                headers: {
                    'token': `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId:postId,
                    content: commentText
                }),
            });
            const data = await response.json();
            console.log("sendComment",data)

            if (data.code === 0) {
                messageApi.success('评论发表成功');
                setCommentText('');
                await fetchPosts();
            } else {
                messageApi.error(data.message || '评论发表失败');
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
        }
    };

    //评论删除
    const handleDeleteComment = async (commentId: number) => {
        try {
            const response = await fetch(`${baseUrl}/comments/delete`, {
                method: 'POST',
                headers: {
                    'token': `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: commentId
                }),
            });
            const data = await response.json();
            console.log("deleteComment",data)

            if (data.code === 0) {
                messageApi.success('评论删除成功');
                await fetchPosts();
            } else {
                messageApi.error(data.message || '评论删除失败');
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
        }
    };

    //评论编辑（前端呈现）
    const handleEditComment = (comment: Comment) => {
        setEditingComment(comment);
        editForm.setFieldsValue({ content: comment.content });
        setEditModalVisible(true);
    };

    //评论编辑（同步服务器）
    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validateFields();
            const response = await fetch(`${baseUrl}/comments/edit`, {
                method: 'POST',
                headers: {
                    'token': `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingComment?.id,
                    content: values.content
                }),
            });
            const data = await response.json();
            console.log("editComment",data)

            if (data.code === 0) {
                messageApi.success('评论修改成功');
                setEditModalVisible(false);
                await fetchPosts();
            } else {
                messageApi.error(data.message || '评论修改失败');
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
        }
    };

    //帖子点赞
    const handleLikePost = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(baseUrl + '/post_thumb/', {
                method: 'POST',
                headers: {
                    'token': `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: parseFloat(postId)
                }),
            });

            const data = await response.json();

            if (data.code === 0) {
                messageApi.success('操作成功');
                await fetchPosts();
            } else {
                messageApi.error(data.message || '操作失败');
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
        }
    };

    //评论点赞
    const handleLikeComment = async (commentId: number) => {
        try {
            const response = await fetch(`${baseUrl}/comments_thumb/`, {
                method: 'POST',
                headers: {
                    'token': `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentsId: commentId
                }),
            });
            const data = await response.json();

            if (data.code === 0) {
                await fetchPosts();
            } else {
                messageApi.error(data.message || '操作失败');
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 w-full">
            {contextHolder}

            <Link
                href={`./`}
                className="text-[#f38181] hover:text-[#e66767] mb-4 inline-block"
            >
                ← 返回讨论区
            </Link>

            {/* 主帖子 */}
            <Card key={post.id} className="mb-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <img
                                src={post.user.userAvatar ? (post.user.userAvatar.startsWith('/9j/') ? `data:image/jpeg;base64,${post.user.userAvatar}`:post.user.userAvatar) : '/img/people.png'}
                                className="w-5 h-5 object-cover rounded-full"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/img/people.png';
                                }}
                            />
                            <span className="font-medium ml-1">{post.user.userName}</span>
                            <span className="text-gray-500 text-sm">{formatDate(new Date(post.createTime))}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{post.content}</p>
                        <Button
                            icon={<LikeOutlined/>}
                            type="text"
                            onClick={handleLikePost}
                            style={{color: post.hasThumb ? '#1890ff' : undefined}}
                        >
                            {post.thumbNum}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* 评论区 */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold my-4">评论 ({post.commentsVOS?post.commentsVOS.length:0})</h2>

                {/* 评论列表*/}
                <div className="space-y-4">
                    {post.commentsVOS?post.commentsVOS.map((comment) => {
                        const user = usersMap[comment.userId];
                        if(user){
                            return (
                                <div key={comment.id} className="mb-4">
                                    <Card>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <img
                                                        src={user.userAvatar ? (user.userAvatar.startsWith('/9j/') ? `data:image/jpeg;base64,${user.userAvatar}`: user.userAvatar) : '/img/people.png'}
                                                        className="w-5 h-5 object-cover rounded-full"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/img/people.png';
                                                        }}
                                                    />
                                                    <span
                                                        className="font-medium ml-1">{user.userName}</span>
                                                    <span
                                                        className="text-gray-500 text-sm">{formatDate(new Date(comment.createTime))}</span>
                                                </div>
                                                <p className="text-gray-700 mb-2">{comment.content}</p>
                                                <div className="flex items-center">
                                                    <Button
                                                        icon={<LikeOutlined/>}
                                                        type="text"
                                                        onClick={() => handleLikeComment(Number(comment.id))}
                                                        style={{color:comment.hasThumb ? '#1890ff' : ''}}
                                                    >
                                                        {comment.thumbNum}
                                                    </Button>
                                                    {currentUser && currentUser.id === comment.userId && (
                                                        <div className="ml-2">
                                                            <Button
                                                                icon={<EditOutlined/>}
                                                                type="text"
                                                                onClick={() => handleEditComment(comment)}
                                                            />
                                                            <Popconfirm
                                                                title="确定要删除这条评论吗？"
                                                                onConfirm={() => handleDeleteComment(comment.id)}
                                                                okText="确定"
                                                                cancelText="取消"
                                                            >
                                                                <Button
                                                                    icon={<DeleteOutlined/>}
                                                                    type="text"
                                                                    danger
                                                                />
                                                            </Popconfirm>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            );
                        }
                        return null;
                    }):null}
                </div>

                {/* 评论输入框 */}
                {currentUser && (
                    <Card>
                        <TextArea
                            rows={4}
                            placeholder="写下你的评论..."
                            className="mb-4"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button
                                type="default"
                                className="bg-[#f38181] hover:bg-[#e66767] text-white mt-2"
                                onClick={handleCommentSubmit}
                            >
                                发表评论
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* 编辑评论模态框 */}
            <Modal
                title="编辑评论"
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={handleEditSubmit}
            >
                <Form form={editForm}>
                    <Form.Item
                        name="content"
                        rules={[{required: true, message: '请输入评论内容'}]}
                    >
                        <Input.TextArea rows={4}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}