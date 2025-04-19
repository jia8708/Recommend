'use client'

import {usePathname} from 'next/navigation'
import Link from 'next/link'

interface PaginationProps {
    totalPages: number
    currentPage: number
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
    const pathname = usePathname()
    const basePath = pathname
        .replace(/^\//, '')
        .replace(/\/page\/\d+$/, '')
    const prevPage = currentPage - 1 > 0
    const nextPage = currentPage + 1 <= totalPages

    return (
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <nav className="flex justify-between">
                {!prevPage && (
                    <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
                        上一页
                    </button>
                )}
                {prevPage && (
                    <Link
                        href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
                        rel="prev"
                    >
                        上一页
                    </Link>
                )}
                <span>
          {currentPage} / {totalPages}
        </span>
                {!nextPage && (
                    <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
                        下一页
                    </button>
                )}
                {nextPage && (
                    <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
                        下一页
                    </Link>
                )}
            </nav>
        </div>
    )
}