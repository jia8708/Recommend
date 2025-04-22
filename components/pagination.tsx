'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import { usePagination } from '@/contexts/PaginationContext'

interface PaginationProps {
    totalPages: number
}

export default function Pagination({
    totalPages,
}: PaginationProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { currentPage, setCurrentPage } = usePagination()

    // 创建带页码的新URL
    const createPageURL = useCallback((pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }, [pathname, searchParams])

    const prevPage = currentPage - 1 > 0
    const nextPage = currentPage + 1 <= totalPages

    return (
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <nav className="flex justify-between">
                {!prevPage && (
                    <button className="cursor-auto disabled:opacity-50" disabled>
                        上一页
                    </button>
                )}
                {prevPage && (
                    <Link
                        href={createPageURL(currentPage - 1)}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        rel="prev"
                    >
                        上一页
                    </Link>
                )}
                <span>
                    {currentPage} / {totalPages}
                </span>
                {!nextPage && (
                    <button className="cursor-auto disabled:opacity-50" disabled>
                        下一页
                    </button>
                )}
                {nextPage && (
                    <Link
                        href={createPageURL(currentPage + 1)}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        rel="next"
                    >
                        下一页
                    </Link>
                )}
            </nav>
        </div>
    )
}