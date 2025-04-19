'use client'
import { getLeaderInfo, LeaderInfo } from "@/app/leader/util";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getImage } from "@/utils/util";

const navItems = [
    { name: '首页', path: '/introduce' },
    { name: '招生计划', path: '/plan' },
    { name: '项目', path: '/project' },
    { name: '研究', path: '/research' },
    { name: '交流论坛', path: '/forum' }
];

export default function LeaderSidebar({ slug }: { slug: string }) {
    const [leader, setLeader] = useState<LeaderInfo | null>(null);
    const [imageUrl, setImageUrl] = useState('/img/people.png');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true; // 用于防止组件卸载后设置状态

        const fetchData = async () => {
            try {
                // 获取导师信息
                const leaderData = await getLeaderInfo(slug);
                if (!isMounted) return;

                if (!leaderData) {
                    router.replace('/404');
                    return;
                }

                setLeader(leaderData);

                // 获取导师图片
                if (leaderData.image) {
                    try {
                        const url = await getImage(leaderData.image);
                        if (isMounted) setImageUrl(url);
                    } catch (imageError) {
                        console.error('Failed to load avatar:', imageError);
                        if (isMounted) setImageUrl('/img/people.png');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch leader:', err);
                if (isMounted) {
                    setError('加载导师信息失败，请稍后重试');
                    router.replace('/error');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            // 清理Blob URL
            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [slug, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!leader) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-col items-center flex-1 mb-8">
                <div className="w-48 h-48 mb-8">
                    <img
                        src={imageUrl}
                        alt={leader.name}
                        className="rounded-full w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/img/people.png';
                        }}
                    />
                </div>

                <h1 className="text-3xl font-bold mb-4">{leader.name}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    {leader.specialty}
                </p>
            </div>

            <div className="flex-2 p-4">
                <nav className="space-y-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={`/leader/${slug}${item.path}`}
                            className="group block"
                            prefetch={false} // 可选：禁用预加载
                        >
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="font-medium">{item.name}</span>
                                <svg
                                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}