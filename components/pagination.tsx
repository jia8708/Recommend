'use client'

import {usePathname, useSearchParams} from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'

interface PaginationProps {
    totalPages: number
    currentPage: number
    onPageChange?: (page: number) => void // 可选的回调函数
}

export default function Pagination({
                                       totalPages,
                                       currentPage,
                                       onPageChange
                                   }: PaginationProps)  {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // 创建带页码的新URL
    const createPageURL = useCallback((pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }, [pathname, searchParams])

    const prevPage = currentPage - 1 > 0
    const nextPage = currentPage + 1 <= totalPages

    // 处理页码变化
    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page) // 如果有回调优先使用
        }
        // 如果没有回调，默认行为是通过URL变化
    }

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
                        onClick={() => handlePageChange(currentPage - 1)}
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        rel="next"
                    >
                        下一页
                    </Link>
                )}
            </nav>
        </div>
    )
}