import { notFound } from 'next/navigation'
import { formatDate, getBlogPosts } from '../util'
import {Info} from '../util';

//获取文章所有路径
// export async function generateStaticParams(){
//     const posts = getBlogPosts()
//
//     return posts.map((post:Info) => ({
//         slug: post.slug,
//     }))
// }

export default function BlogPosts({ params }) {
    //接收Link组件跳转时传递的页面参数 并 比较
    const post = getBlogPosts().find((post:Info) => post.slug === params.slug)

    if (!post) {
        notFound()
    }

    return (
        <section>
            {/*标题*/}
            <h1 className="title font-semiblod text-2xl tracking-tighter">
                {post.metadata.title}
            </h1>
            {/*时间*/}
            <div className="flex justify-between items-center mt-2 mb-8 text-sm">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatDate(post.metadata.publishedAt)}
                </p>
            </div>
            {/*文章内容*/}
            <article className="prose">
                {post.content}
            </article>
        </section>
    );
}
