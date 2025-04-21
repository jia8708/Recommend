import { Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface LoginFormValues {
    userAccount: string;
    userPassword: string;
}

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                userAccount: values.userAccount,
                userPassword: values.userPassword,
            });

            if (result?.error) {
                messageApi.error('登录失败，请检查用户名和密码');
            } else {
                messageApi.success('登录成功');
                router.push('/user/info');
            }
        } catch (error) {
            messageApi.error('登录失败，请稍后重试');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 w-1/3">
            {contextHolder}
            <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
            <Form
                name="login"
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

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full bg-[#f38181] hover:bg-[#e66767]"
                    >
                        登录
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}