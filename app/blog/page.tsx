import { BlogPosts } from '@/components/posts'

//分享页面时的信息设置
export const metadata = {
    title: 'Blog',
    description: 'Read my blog.',
}

export default function Page() {
    return (
        <section>
            <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Blog</h1>
            <BlogPosts />
        </section>
    )
}
