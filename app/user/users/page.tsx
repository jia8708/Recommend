'use client'
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, Upload, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { UploadFile } from 'antd/es/upload/interface';

interface UserData {
    id: string;
    userName: string;
    userAccount: string;
    userAvatar: string;
    userProfile: string;
    userRole: string;
}

export default function UsersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [messageApi, contextHolder] = message.useMessage();

    // 检查是否是管理员
    useEffect(() => {
        if (session?.user?.role !== 'admin') {
            router.push('/user/info');
        }
    }, [session, router]);

    // 获取用户列表
    const fetchUsers = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/user/list/page`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${session?.accessToken}`
                },
                body: JSON.stringify({})
            });
            const data = await response.json();
            if (data.code === 0) {
                setUsers(data.data.records);
            } else {
                messageApi.error(data.message || '获取用户列表失败');
            }
        } catch (error) {
            console.log(error)
            messageApi.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.accessToken) {
            fetchUsers();
        }
    }, [session?.accessToken]);

    // 处理图片上传
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

    // 处理表单提交
    const handleSubmit = async (values: any) => {
        try {
            let avatarBase64 = values.userAvatar;
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const compressedFile = await compressImage(fileList[0].originFileObj);
                avatarBase64 = await getBase64(compressedFile);
                if (avatarBase64.startsWith('data:image')) {
                    avatarBase64 = avatarBase64.split(',')[1];
                }
            }

            const userData = {
                ...values,
                userAvatar: avatarBase64,
            };

            if (editingUser) {
                // 更新用户
                const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/user/update`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': `${session?.accessToken}`
                    },
                    body: JSON.stringify({
                        id: editingUser.id,
                        ...userData
                    })
                });
                const data = await response.json();
                if (data.code === 0) {
                    messageApi.success('更新成功');
                    fetchUsers();
                } else {
                    messageApi.error(data.message || '更新失败');
                }
            } else {
                // 创建用户
                const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/user/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': `${session?.accessToken}`
                    },
                    body: JSON.stringify(userData)
                });
                const data = await response.json();
                if (data.code === 0) {
                    messageApi.success('创建成功');
                    fetchUsers();
                } else {
                    messageApi.error(data.message || '创建失败');
                }
            }
            setModalVisible(false);
            form.resetFields();
            setFileList([]);
        } catch (error) {
            console.log(error)
            messageApi.error('操作失败');
        }
    };

    // 处理删除用户
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/user/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${session?.accessToken}`
                },
                body: JSON.stringify({ id })
            });
            const data = await response.json();
            if (data.code === 0) {
                messageApi.success('删除成功');
                fetchUsers();
            } else {
                messageApi.error(data.message || '删除失败');
            }
        } catch (error) {
            console.log(error)
            messageApi.error('删除失败');
        }
    };

    const columns = [
        {
            title: '头像',
            dataIndex: 'userAvatar',
            key: 'userAvatar',
            render: (avatar: string) => (
                <img
                    src={avatar ? (avatar.startsWith('/9j/') ? `data:image/jpeg;base64,${avatar}` : avatar) : '/img/people.png'}
                    alt="头像"
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/people.png';
                    }}
                />
            )
        },
        {
            title: '用户名',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: '账号',
            dataIndex: 'userAccount',
            key: 'userAccount',
        },
        {
            title: '简介',
            dataIndex: 'userProfile',
            key: 'userProfile',
        },
        {
            title: '角色',
            dataIndex: 'userRole',
            key: 'userRole',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: UserData) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        onClick={() => {
                            setEditingUser(record);
                            form.setFieldsValue(record);
                            setModalVisible(true);
                        }}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这位用户吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="text"
                            danger
                        >
                            删除
                        </Button>
                    </Popconfirm>

                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            {contextHolder}
            <div className="flex justify-between mb-4 w-full">
                <h1 className="text-2xl font-bold">用户管理</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingUser(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                    className="bg-[#f38181] hover:bg-[#e66767]"
                >
                    添加用户
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title={editingUser ? "编辑用户" : "添加用户"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setFileList([]);
                }}
                onOk={() => form.submit()}
                okText="确认"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="userName"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="userAccount"
                            label="账号"
                            rules={[{ required: true, message: '请输入账号' }]}
                        >
                            <Input />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="userAvatar"
                        label="头像"
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            {fileList.length < 1 && <UploadOutlined />}
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="userProfile"
                        label="简介"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        name="userRole"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select>
                            <Select.Option value="user">普通用户</Select.Option>
                            <Select.Option value="admin">管理员</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
} 