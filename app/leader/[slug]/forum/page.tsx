'use client'
import {usePathname} from 'next/navigation'
import Link from 'next/link';
import {Card, Space, Button, Modal, Form, Input, message, Popconfirm, Spin} from 'antd';
import { LikeOutlined, MessageOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import {baseUrl} from "@/utils/constance";
import {formatDate} from "@/utils/util";
import {Post,User} from "@/app/leader/[slug]/forum/util";
import { useSession } from "next-auth/react";

const { TextArea } = Input;

export default function ForumPage() {
    const { data: session,status } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [tags, setTags] = useState('');
    const [editTags, setEditTags] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPost, setCurrentPost] = useState<Post | null>(null);

    const pathname = usePathname()
    const path = pathname.split('/')
    const slug = path[2];

    // 获取帖子列表
    useEffect(() => {
        if (status === "loading") return; // session 正在加载时不执行

        if (status === "unauthenticated") {
            messageApi.warning('请先登录');
            return;
        }

        if (status === "authenticated" && session?.accessToken) {
            fetchPosts();
            fetchCurrentUser();
        }
    }, [session, status]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await fetch(baseUrl+'/post/list/page/vo', {
                method: 'POST',
                headers: {
                    'token': `${session?.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mentorId:Number(slug)
                }),
            });
            const data = await response.json();

            if (data.code === 0) {
                setAllPosts(data.data.records);
            } else {
                messageApi.error(data.message || '获取帖子列表失败');
            }
        } catch (error) {
            messageApi.error('网络错误，请稍后重试');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`${baseUrl}/user/get/login`, {
                headers: {
                    'token': `${session?.accessToken}`
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

    // 监听输入内容
    const handleTagsChange = (e) => {
        const value = e.target.value;
        setTags(value.replace(/\s+/g, ''));
    };

    const handleEditTagsChange = (e) => {
        const value = e.target.value;
        setEditTags(value.replace(/\s+/g, ''));
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const showEditModal = (post: Post) => {
        setCurrentPost(post);
        editForm.setFieldsValue({
            title: post.title,
            content: post.content
        });
        setEditTags(post.tags?.join(', ') || '');
        setIsEditModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                const tagsArray = tags.split(',').map((tag) => tag.trim());
                const response = await fetch(baseUrl+'/post/add', {
                    method: 'POST',
                    headers: {
                        'token': `${session?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: values.title,
                        content: values.content,
                        tags: tagsArray,
                        mentorId:Number(slug)
                    }),
                });

                const data = await response.json();
                console.log("data",data,"ok",response.ok);

                if (data.code === 0) {
                    messageApi.success('帖子创建成功');
                    fetchPosts();
                    form.resetFields();
                    setTags('');
                    setIsModalOpen(false);
                } else {
                    messageApi.error(data.message || '帖子创建失败');
                }
            } catch (error) {
                messageApi.error('创建帖子失败，请稍后重试');
                console.error(error);
            }
        }).catch((info) => {
            console.log('Validate Failed:', info);
        });
    };

    const handleEditOk = () => {
        const url = currentUser?.userRole === 'admin'?'/post/update':'/post/edit'
        editForm.validateFields().then(async (values) => {
            try {
                const tagsArray = editTags.split(',').map((tag) => tag.trim());
                const response = await fetch(baseUrl+url, {
                    method: 'POST',
                    headers: {
                        'token': `${session?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: currentPost?.id,
                        title: values.title,
                        content: values.content,
                        tags: tagsArray,
                        mentorId:Number(slug)
                    }),
                });

                const data = await response.json();

                if (data.code === 0) {
                    messageApi.success('帖子更新成功');
                    fetchPosts();
                    editForm.resetFields();
                    setEditTags('');
                    setIsEditModalOpen(false);
                    setCurrentPost(null);
                } else {
                    messageApi.error(data.message || '帖子更新失败');
                }
            } catch (error) {
                messageApi.error('更新帖子失败，请稍后重试');
                console.error(error);
            }
        }).catch((info) => {
            console.log('Validate Failed:', info);
        });
    };

    const handleCancel = () => {
        form.resetFields();
        setTags('');
        setIsModalOpen(false);
    };

    const handleEditCancel = () => {
        editForm.resetFields();
        setEditTags('');
        setIsEditModalOpen(false);
        setCurrentPost(null);
    };

    // 删除帖子
    const handleDelete = async (postId: number, e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(baseUrl+`/post/delete`, {
                method: 'POST',
                headers: {
                    'token': `${session?.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: postId
                })
            });

            if (response.ok) {
                messageApi.success('帖子删除成功');
                setAllPosts(allPosts.filter(post => post.id !== postId));
            } else {
                const data = await response.json();
                messageApi.error(data.message || '帖子删除失败');
            }
        } catch (error) {
            messageApi.error('删除帖子失败，请稍后重试');
            console.error(error);
        }
    };

    //点赞帖子
    const handleLike = async (postId: number, e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(baseUrl + '/post_thumb/', {
                method: 'POST',
                headers: {
                    'token': `${session?.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: postId
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

    if (status === "loading") {
        return <div className="flex justify-center items-center min-h-screen">
            <Spin size="large" />
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 w-full">
            {contextHolder}
            <div className="flex justify-between items-center mb-8 w-full">
                <h1 className="text-2xl font-bold">讨论区</h1>
                <Button
                    type="default"
                    className="bg-[#f38181] hover:bg-[#e66767] text-white"
                    onClick={showModal}
                    loading={loading}
                >
                    发布新帖子
                </Button>
            </div>

            {/* 发帖模态框 */}
            <Modal
                title="发布新帖子"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="发布"
                cancelText="取消"
                confirmLoading={loading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="post_form"
                >
                    <Form.Item
                        name="title"
                        label="标题"
                        rules={[{ required: true, message: '请输入帖子标题!' }]}
                    >
                        <Input placeholder="请输入帖子标题" />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="内容"
                        rules={[{ required: true, message: '请输入帖子内容!' }]}
                    >
                        <TextArea rows={6} placeholder="请输入帖子内容" />
                    </Form.Item>
                    <Form.Item
                        name="tags"
                        label="标签"
                        rules={[{ required: false}]}
                    >
                        <Input
                            placeholder="请输入帖子标签，以逗号分隔"
                            value={tags}
                            onChange={handleTagsChange}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 编辑帖子模态框 */}
            <Modal
                title="编辑帖子"
                open={isEditModalOpen}
                onOk={handleEditOk}
                onCancel={handleEditCancel}
                okText="保存"
                cancelText="取消"
                confirmLoading={loading}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    name="edit_post_form"
                >
                    <Form.Item
                        name="title"
                        label="标题"
                        rules={[{ required: true, message: '请输入帖子标题!' }]}
                    >
                        <Input placeholder="请输入帖子标题" />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="内容"
                        rules={[{ required: true, message: '请输入帖子内容!' }]}
                    >
                        <TextArea rows={6} placeholder="请输入帖子内容" />
                    </Form.Item>
                    <Form.Item
                        name="tags"
                        label="标签"
                        rules={[{ required: false}]}
                    >
                        <Input
                            placeholder="请输入帖子标签，以逗号分隔"
                            value={editTags}
                            onChange={handleEditTagsChange}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <div className="space-y-4">
                {allPosts.length > 0 ? allPosts.map((post) => (
                        <div className="mb-8" key={post.id}>
                            <Card
                                hoverable
                                className="w-full"
                                actions={[
                                    <Space
                                        key="like"
                                        onClick={(e) => handleLike(post.id, e)}
                                        style={{ cursor: 'pointer',color: post.hasThumb ? '#1890ff' : undefined }}
                                    >
                                        <LikeOutlined />
                                        {post.thumbNum}
                                    </Space>,
                                    <Space key="comment">
                                        <MessageOutlined/>
                                        {post.commentsVOS ? post.commentsVOS.length : 0}
                                    </Space>,
                                    (currentUser?.userRole === 'admin' || currentUser?.id === post.user.id) && (
                                        <EditOutlined
                                            key="edit"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                showEditModal(post);
                                            }}
                                        />
                                    ),
                                    (currentUser?.userRole === 'admin' || currentUser?.id === post.user.id) && (
                                    <Popconfirm
                                        title="确定要删除这条帖子吗？"
                                        onConfirm={() => handleDelete(post.id, new MouseEvent('click') as unknown as React.MouseEvent<HTMLElement>)}
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <Button
                                            icon={<DeleteOutlined/>}
                                            type="text"
                                            danger
                                        />
                                    </Popconfirm>
                                    )
                                ].filter(Boolean)}
                            >
                                <Link href={`/leader/${slug}/forum/${post.id}`} passHref>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold mb-2 text-black">{post.title}</h2>
                                        <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                                        <div className="flex items-center space-x-4 text-gray-500">
                                            <Space>
                                                <img
                                                    src={post.user.userAvatar ? (post.user.userAvatar.startsWith('/9j/') ? `data:image/jpeg;base64,${post.user.userAvatar}`:post.user.userAvatar) : '/img/people.png'}
                                                    className="w-5 h-5 object-cover rounded-full"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/img/people.png';
                                                    }}
                                                />
                                                <span>{post.user.userName}</span>
                                                <span>{formatDate(new Date(post.createTime))}</span>
                                            </Space>
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex space-x-2">
                                                    {post.tags.map((tag, index) => (
                                                        <span key={index}
                                                              className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                </Link>
                            </Card>
                        </div>
                )) : <div className="flex justify-center text-gray-500">暂无帖子</div>}
            </div>
        </div>
    );
}