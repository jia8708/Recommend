'use client'
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Upload, Popconfirm, Space } from 'antd';
import { PlusOutlined, UploadOutlined, MinusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { baseUrl } from '@/utils/constance';
import type { UploadFile } from 'antd/es/upload/interface';

interface Project {
    id?: string;
    mentor_id?: string;
    project: string;
}

interface LeaderData {
    id: string;
    name: string;
    specialty: string;
    mentor_msg: string;
    research: string;
    mentor_job: string;
    image: string;
    employment: string;
    projects: Project[];
}

export default function LeadersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [leaders, setLeaders] = useState<LeaderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLeader, setEditingLeader] = useState<LeaderData | null>(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // 检查是否是管理员
    useEffect(() => {
        if (session?.user?.role !== 'admin') {
            router.push('/user/info');
        }
    }, [session, router]);

    // 获取导师列表
    const fetchLeaders = async (page = currentPage, size = pageSize, searchMessage = searchText) => {
        try {
            const response = await fetch(`${baseUrl}/mentor/page`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${session?.accessToken}`
                },
                body: JSON.stringify({
                    current: page,
                    pageSize: size,
                    message: searchMessage || undefined
                })
            });
            const data = await response.json();
            if (data.code === 0) {
                setLeaders(data.data.records);
                setTotal(data.data.total);
            } else {
                messageApi.error(data.message || '获取导师列表失败');
            }
        } catch {
            messageApi.error('获取导师列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.accessToken) {
            fetchLeaders();
        }
    }, [session?.accessToken]);

    // 获取导师详细信息
    const fetchLeaderDetail = async (id: string) => {
        try {
            const response = await fetch(`${baseUrl}/mentor/getById?id=${id}`, {
                headers: {
                    'token': `${session?.accessToken}`
                }
            });
            const data = await response.json();
            if (data.code === 0) {
                setEditingLeader(data.data);
                form.setFieldsValue({
                    ...data.data,
                    projects: data.data.projects?.map((p: Project) => ({ project: p.project })) || []
                });
                setModalVisible(true);
            } else {
                messageApi.error(data.message || '获取导师信息失败');
            }
        } catch {
            messageApi.error('获取导师信息失败');
        }
    };

    // 处理图片上传
    const handleUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${baseUrl}/mentor/upload`, {
                method: 'POST',
                headers: {
                    'token': `${session?.accessToken}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.code === 0) {
                return data.data;
            } else {
                messageApi.error(data.message || '上传失败');
                return null;
            }
        } catch {
            messageApi.error('上传失败');
            return null;
        }
    };

    // 处理表单提交
    const handleSubmit = async (values: any) => {
        try {
            let imageUrl = values.image;
            if (fileList.length > 0 && fileList[0].originFileObj) {
                imageUrl = await handleUpload(fileList[0].originFileObj);
                if (!imageUrl) return;
            }

            const projects = values.projects?.map((p: { project: string }) => ({
                project: p.project
            })) || [];

            const leaderData = {
                ...values,
                image: imageUrl,
                projects
            };

            if (editingLeader) {
                // 更新导师
                const response = await fetch(`${baseUrl}/mentor/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': `${session?.accessToken}`
                    },
                    body: JSON.stringify({
                        ...leaderData,
                        id: Number(editingLeader.id),
                    })
                });
                const data = await response.json();
                if (data.code === 0) {
                    messageApi.success('更新成功');
                    fetchLeaders();
                } else {
                    messageApi.error(data.message || '更新失败');
                }
            } else {
                // 创建导师
                const response = await fetch(`${baseUrl}/mentor/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': `${session?.accessToken}`
                    },
                    body: JSON.stringify(leaderData)
                });
                const data = await response.json();
                if (data.code === 0) {
                    messageApi.success('创建成功');
                    fetchLeaders();
                } else {
                    messageApi.error(data.message || '创建失败');
                }
            }
            setModalVisible(false);
            form.resetFields();
            setFileList([]);
        } catch {
            messageApi.error('操作失败');
        }
    };

    // 处理删除导师
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${baseUrl}/mentor/delete?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'token': `${session?.accessToken}`
                }
            });
            const data = await response.json();
            if (data.code === 0) {
                messageApi.success('删除成功');
                fetchLeaders();
            } else {
                messageApi.error(data.message || '删除失败');
            }
        } catch {
            messageApi.error('删除失败');
        }
    };

    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '专业',
            dataIndex: 'specialty',
            key: 'specialty',
        },
        {
            title: '职称',
            dataIndex: 'mentor_job',
            key: 'mentor_job',
        },
        {
            title: '研究方向',
            dataIndex: 'research',
            key: 'research',
            ellipsis: true,
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: LeaderData) => (
                <div className="space-x-2">
                    <Button
                        type="link"
                        onClick={() => fetchLeaderDetail(record.id)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这位老师吗？"
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
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">导师管理</h1>
                <Space>
                    <Input
                        placeholder="搜索导师"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={() => fetchLeaders(1, pageSize, searchText)}
                        suffix={
                            <SearchOutlined
                                style={{ cursor: 'pointer' }}
                                onClick={() => fetchLeaders(1, pageSize, searchText)}
                            />
                        }
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingLeader(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                        className="bg-[#f38181] hover:bg-[#e66767]"
                    >
                        添加导师
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={leaders}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                        fetchLeaders(page, size);
                    }
                }}
            />

            <Modal
                title={editingLeader ? "编辑导师" : "添加导师"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setFileList([]);
                }}
                onOk={() => form.submit()}
                okText="确认"
                cancelText="取消"
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="姓名"
                        rules={[{ required: true, message: '请输入姓名' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="specialty"
                        label="专业"
                        rules={[{ required: true, message: '请输入专业' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="mentor_job"
                        label="职称"
                        rules={[{ required: true, message: '请输入职称' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="mentor_msg"
                        label="导师信息"
                        rules={[{ required: true, message: '请输入导师信息' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="research"
                        label="研究方向"
                        rules={[{ required: true, message: '请输入研究方向' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="employment"
                        label="就业方向"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="照片"
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

                    <Form.List name="projects">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'project']}
                                            rules={[{ required: true, message: '请输入项目信息' }]}
                                        >
                                            <Input placeholder="请输入项目信息" style={{ width: '600px' }} />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        添加项目
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
}