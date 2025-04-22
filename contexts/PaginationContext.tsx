'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface PaginationContextType {
  currentPage: number
  setCurrentPage: (page: number) => void
  searchText: string
  setSearchText: (text: string) => void
}

const PaginationContext = createContext<PaginationContextType | undefined>(undefined)

export function PaginationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState('')

  return (
    <PaginationContext.Provider value={{ currentPage, setCurrentPage, searchText, setSearchText }}>
      {children}
    </PaginationContext.Provider>
  )
}

export function usePagination() {
  const context = useContext(PaginationContext)
  if (context === undefined) {
    throw new Error('usePagination must be used within a PaginationProvider')
  }
  return context
} 