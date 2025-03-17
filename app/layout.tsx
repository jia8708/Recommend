import React from "react";
import '../css/input.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import  Navbar  from '../components/nav'
import Footer from '../components/footer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const cx = (...classes:any[]) => classes.filter(Boolean).join(' ')

export default function RootLayout({children,}: {children: React.ReactNode}) {
    return (
        <html
            lang="en"
            className={cx(
                'text-black bg-white dark:text-white dark:bg-black',
                GeistSans.variable,
                GeistMono.variable
            )}
        >
        <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            <Navbar />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
        </main>
        </body>
        </html>
    )
}
