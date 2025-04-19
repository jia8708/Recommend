'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

export default function MessageTabs() {
    const pathname = usePathname();

    const tabs = [
        { name: '评论', href: '/user/message/comments' },
        { name: '点赞', href: '/user/message/likes' }
    ];

    return (
        <div className="w-full border-b border-gray-200">
            <nav className="flex">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={clsx(
                            'flex-1 text-center',
                            'py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200',
                            pathname.startsWith(tab.href) ||
                            (pathname === '/user/message' && tab.href === '/user/message/comments')
                                ? 'border-red-500 text-red-500 bg-red-50' // 红色系激活状态
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                    >
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}