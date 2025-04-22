'use client'
import Link from "next/link";
import { useSession } from "next-auth/react";

const baseNavItems = [
    { name: '个人资料', path: '/info' },
    { name: '历史推荐', path: '/history' },
    { name: '消息中心', path: '/message' }
];

const adminNavItems = [
    { name: '用户管理', path: '/users' },
    { name: '导师管理', path: '/leaders' }
];

export default function UserSidebar() {
    const { data: session } = useSession();

    const navItems = [...baseNavItems, ...(session?.user?.role === 'admin' ? adminNavItems : [])];

    return (
        <div className="flex flex-col">
            <div className="flex-2 p-4">
                <nav className="space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={`/user${item.path}`}
                            className="group block"
                        >
                            <div
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="font-medium">{item.name}</span>
                                <svg
                                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}