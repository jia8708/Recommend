'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Tag} from "@/app/tag/util";

export default function Sidebar({tags}: { tags: Tag[] }) {
    const pathname = usePathname()

    return (
        <nav className="space-y-2">
            <Link
                href="/leader"
                className={`block p-2 rounded hover:bg-gray-100 ${
                    pathname.includes('leader') ? 'text-[#f38181]' : ''
                }`}
            >
                所有导师
            </Link>

            {tags.map((tag) => (
                <Link
                    key={tag.name}
                    href={`/tag/${tag.name}`}
                    className="block p-2 rounded hover:bg-gray-100"
                >
                    <div
                        className="flex items-center justify-between p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div>
                            <span className={`${
                                pathname.includes(tag.name) ? 'text-[#f38181]' : ''
                            }`}>
                        {tag.title}
                        </span>
                        </div>
                        <svg
                            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </Link>
            ))}
        </nav>
    )
}