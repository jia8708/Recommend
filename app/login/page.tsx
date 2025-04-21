'use client'
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-start w-full">
            <LoginForm />
            <div className="mt-4">
                还没有账号？<Link href="/register" className="text-sky-500 hover:text-sky-700">立即注册</Link>
            </div>
        </div>
    );
} 