'use client'
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-start">
            <RegisterForm />
            <div className="mt-4">
                已有账号？<Link href="/login" className="text-[#f38181] hover:text-[#e66767]">立即登录</Link>
            </div>
        </div>
    );
} 