import { Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {baseUrl} from "@/utils/constance";

interface RegisterFormValues {
    userAccount: string;
    userPassword: string;
    checkPassword: string;
}

export default function RegisterForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: RegisterFormValues) => {
        if (values.userPassword !== values.checkPassword) {
            messageApi.error('两次输入的密码不一致');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(baseUrl+'/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            console.log('data', data);
            if (data.code === 0) {
                messageApi.success('注册成功，请登录');
                router.push('/login');
            } else {
                messageApi.error(data.message || '注册失败');
                console.error(11111,data.message);
            }
        } catch (error) {
            messageApi.error('注册失败，请稍后重试');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 w-1/3">
            {contextHolder}
            <h1 className="text-2xl font-bold mb-6 text-center">注册</h1>
            <Form
                name="register"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    name="userAccount"
                    rules={[{ required: true, message: '请输入用户名!' }]}
                >
                    <Input placeholder="用户名" />
                </Form.Item>

                <Form.Item
                    name="userPassword"
                    rules={[{ required: true, message: '请输入密码!' }]}
                >
                    <Input.Password placeholder="密码" />
                </Form.Item>

                <Form.Item
                    name="checkPassword"
                    rules={[{ required: true, message: '请确认密码!' }]}
                >
                    <Input.Password placeholder="确认密码" />
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        className="w-full bg-[#f38181] hover:bg-[#e66767]"
                    >
                        注册
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
} 