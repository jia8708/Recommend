'use client'
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Upload, Spin } from 'antd';
import { EditOutlined, LogoutOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload';
import { useRouter } from 'next/navigation';
import type { UploadFile } from 'antd/es/upload/interface';
import { baseUrl } from "@/utils/constance";
import { useSession, signOut } from "next-auth/react";

interface UserInfo {
    userName: string;
    userAvatar: string;
    userProfile: string;
}

export default function UserInfoPage() {
    const { data: session, status, update } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('/img/people.png');
    const [form] = Form.useForm();
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();
    const [user,setUser] = useState<UserInfo|null>(null);

    // 获取用户头像
    const fetchUserAvatar = async () => {
        try {
            const response = await fetch(`${baseUrl}/user/get/login`, {
                headers: {
                    'token': `${session?.accessToken}`
                }
            });
            const data = await response.json();
            if (data.code === 0 && data.data?.userAvatar) {
                const avatar = data.data.userAvatar;
                setAvatarUrl(avatar.startsWith('/9j/') ? `data:image/jpeg;base64,${avatar}` : avatar);
                setUser({
                    userName:data.data.userName,
                    userAvatar:'',
                    userProfile:data.data.userProfile,
                })
            }
        } catch (error) {
            console.error('获取头像失败:', error);
        }
    };

    // 在 session 更新时获取头像
    useEffect(() => {
        if (session?.accessToken && session?.user?.avatarKey) {
            fetchUserAvatar();
        }
    }, [session?.accessToken, session?.user?.avatarKey]);

    // 将图片文件转为Base64
    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const compressImage = async (file: File, maxWidth = 200, quality = 0.7): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob!], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', quality);
                };
            };
            reader.readAsDataURL(file);
        });
    };

    // 处理保存 传给后端base64 从后端也获取base64
    const handleSave = async (values: UserInfo) => {
        setLoading(true);
        try {
            let avatarBase64 = values.userAvatar;
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const compressedFile = await compressImage(fileList[0].originFileObj);
                avatarBase64 = await getBase64(compressedFile);
            }

            if (avatarBase64?.startsWith('data:image')) {
                avatarBase64 = avatarBase64.split(',')[1];
            }

            const response = await fetch(baseUrl+'/user/update/my', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${session?.accessToken}`
                },
                body: JSON.stringify({
                    userName: values.userName,
                    userAvatar: avatarBase64,
                    userProfile: values.userProfile
                }),
            });

            const data = await response.json();

            if (data.code === 0) {
                messageApi.success('资料更新成功');
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: values.userName,
                        profile: values.userProfile,
                        avatarKey: Date.now().toString()
                    }
                });
                // 重新获取用户信息
                await fetchUserAvatar();
                setIsEditing(false);
                setFileList([]);
            } else {
                throw new Error(data.message || '更新失败');
            }
        } catch (error) {
            console.error('更新失败:', error);
            messageApi.error('更新失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 上传前的验证
    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            messageApi.error('只能上传图片文件!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            messageApi.error('图片大小不能超过2MB!');
            return false;
        }
        return false; // 返回false，手动处理上传
    };

    // 处理文件变化
    const handleChange: UploadProps['onChange'] = (info) => {
        setFileList(info.fileList.slice(-1)); // 只保留最新文件
    };

    // 处理编辑按钮点击
    const handleEdit = () => {
        form.setFieldsValue({
            userName: session?.user?.name,
            userAvatar: session?.user?.image,
            userProfile: session?.user?.profile
        });
        setIsEditing(true);
    };

    // 处理退出登录
    const handleLogout = async () => {
        try {
            await signOut({ redirect: false });
            messageApi.success('已退出登录');
            router.push('/login');
        } catch (error) {
            messageApi.error('退出失败，请稍后重试');
            console.error(error);
        }
    };

    if (status === "loading") {
        return <div className="flex justify-center items-center min-h-screen">
            <Spin size="large" />
        </div>;
    }

    if (status === "unauthenticated") {
        router.push('/login');
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 w-full">
            {contextHolder}
            <Spin spinning={loading}>
                <Card
                    title="个人资料"
                    extra={
                        <div className="space-x-4">
                            <Button
                                type="text"
                                icon={<EditOutlined/>}
                                onClick={handleEdit}
                                disabled={isEditing}
                            >
                                编辑
                            </Button>
                            <Button
                                type="text"
                                danger
                                icon={<LogoutOutlined/>}
                                onClick={handleLogout}
                            >
                                退出登录
                            </Button>
                        </div>
                    }
                >
                    {!isEditing ? (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={avatarUrl}
                                    className="w-20 h-20 object-cover rounded-full mb-2"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/img/people.png';
                                    }}
                                    alt="用户头像"
                                />
                                <div>
                                    <h2 className="text-xl font-semibold ml-4">{user?.userName}</h2>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium mb-2">简介</h3>
                                <p className="text-gray-600">{user?.userProfile || '暂无简介'}</p>
                            </div>
                        </div>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSave}
                            initialValues={{
                                userName: session?.user?.name,
                                userAvatar: session?.user?.image,
                                userProfile: session?.user?.profile
                            }}
                        >
                            <Form.Item
                                name="userName"
                                label="昵称"
                                rules={[{required: true, message: '请输入昵称!'}]}
                            >
                                <Input/>
                            </Form.Item>

                            <Form.Item
                                name="userAvatar"
                                label="头像"
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    beforeUpload={beforeUpload}
                                    onChange={handleChange}
                                    accept="image/*"
                                    maxCount={1}
                                >
                                    {fileList.length >= 1 ? null : (
                                        <div>
                                            <UploadOutlined/>
                                            <div style={{marginTop: 8}}>上传头像</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>

                            <Form.Item
                                name="userProfile"
                                label="个人简介"
                            >
                                <Input.TextArea rows={4}/>
                            </Form.Item>

                            <Form.Item>
                                <div className="flex justify-end space-x-4">
                                    <Button onClick={() => {
                                        setIsEditing(false);
                                        setFileList([]);
                                    }}>
                                        取消
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="bg-[#f38181] hover:bg-[#e66767]"
                                    >
                                        保存
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    )}
                </Card>
            </Spin>
        </div>
    );
}