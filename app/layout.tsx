'use client'
import React from "react";
import '../css/input.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import  Navbar  from '../components/nav'
import Footer from '../components/footer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SessionProvider } from 'next-auth/react';
// import './globals.css';

const cx = (...classes:any[]) => classes.filter(Boolean).join(' ')

export default function RootLayout({children,}: {children: React.ReactNode}) {
    return (
        <html
            lang="zh"
            className={cx(
                'text-black bg-white dark:text-white dark:bg-black',
                GeistSans.variable,
                GeistMono.variable
            )}
        >
        <body className="antialiased max-w-5xl w-full mt-8 lg:mx-auto">
        <SessionProvider>
            <main className="min-w-0 mt-6 flex flex-col px-2 md:px-0">
                <Navbar />
                <AntdRegistry>{children}</AntdRegistry>
                <Analytics />
                <SpeedInsights />
            </main>
        </SessionProvider>
        </body>
        </html>
    )
}
