import Link from 'next/link'

const navItems = {
    '/': {
        name: '主页',
    },
    '/leader': {
        name: '分类',
    },
    '/recommend': {
        name: '推荐',
    },
    '/resume': {
        name: '简历',
    },
    '/user': {
        name: '我的',
    }
}

export default function Navbar() {
    const entries = Object.entries(navItems)
    const homeEntry = entries.find(([path]) => path === '/') // 提取首页项
    const otherEntries = entries.filter(([path]) => path !== '/') // 其他项

    return (
        <aside className="-ml-[8px] mb-16 tracking-tight bg-sky-50">
            <div className="lg:sticky lg:top-20 px-2">
                <nav
                    className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
                    id="nav"
                >
                    <div className="flex flex-row justify-between items-center w-full pr-10 ">
                        {homeEntry && (
                            <Link
                                href={homeEntry[0]}
                                className={`transition-all hover:text-sky-500 flex align-middle relative py-1 px-2 m-1  ${
                                    homeEntry[0] === '/' ? 'text-[30px] font-semibold' : ''
                                }`}
                            >
                                {homeEntry[1].name}
                            </Link>
                        )}

                        <div className="flex flex-row space-x-0 ">
                            {otherEntries.map(([path, { name }]) => (
                                <Link
                                    key={path}
                                    href={path}
                                    className="transition-all hover:bg-sky-100 dark:hover:text-[#f38181] flex align-middle relative py-1 px-2 m-1 "
                                >
                                    {name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    )
}