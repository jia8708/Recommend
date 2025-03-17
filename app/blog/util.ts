// import fs from 'fs'
// import path from 'path'

export type Metadata = {
    title: string
    publishedAt: string
    summary: string
    image?: string
}

//返回mdx文件中的metadata部分和content部分
// function parseFrontmatter(fileContent: string) {
//     let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
//     let match = frontmatterRegex.exec(fileContent)
//     let frontMatterBlock = match![1]
//     let content = fileContent.replace(frontmatterRegex, '').trim()
//     let frontMatterLines = frontMatterBlock.trim().split('\n')
//     let metadata: Partial<Metadata> = {}
//
//     frontMatterLines.forEach((line) => {
//         let [key, ...valueArr] = line.split(': ')
//         let value = valueArr.join(': ').trim()
//         value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
//         metadata[key.trim() as keyof Metadata] = value
//     })
//
//     return { metadata: metadata as Metadata, content }
// }

//获取所有mdx文件
// function getMDXFiles(dir) {
//     return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
// }

//读取mdx文件的内容，并处理返回metadata和content
// function readMDXFile(filePath) {
//     let rawContent = fs.readFileSync(filePath, 'utf-8')
//     return parseFrontmatter(rawContent)
// }

//根据mdx文件返回对应的 metadata,slug,content
// function getMDXData(dir) {
//     let mdxFiles = getMDXFiles(dir)
//     return mdxFiles.map((file) => {
//         let { metadata, content } = readMDXFile(path.join(dir, file))
//        //不包含扩展名的文件名
//         let slug = path.basename(file, path.extname(file))
//
//         return {
//             metadata,
//             slug,
//             content,
//         }
//     })
// }

//获取文章信息
// export function getBlogPosts() {
//     return getMDXData(path.join(process.cwd(), 'app', 'blog', 'posts'))
// }
export type Info = {
    metadata:Metadata,
    slug:string,
    content:string
}
const info:Info[] = [{metadata:{ title: 'blog1',  publishedAt: '2024-04-08',summary: 'Explore the enduring debate between using spaces and tabs for code indentation, and why this choice matters more than you might think.'},slug:'blog1',content:'Explore the enduring debate between using spaces and tabs for code indentation, and why this choice matters more than you might think.'},
    {metadata:{ title: 'blog2',  publishedAt: '2024-02-08',summary: 'Explore the enduring debate between using spaces and tabs for code indentation, and why this choice matters more than you might think.'},slug:'blog2',content:'Explore the enduring debate between using spaces and tabs for code indentation, and why this choice matters more than you might think.'},
    {metadata:{ title: 'blog3',  publishedAt: '2023-11-08',summary: 'Explore the enduring debate between using spaces and tabs for code indentation, and why this choice matters more than you might think.'},slug:'blog3',content:'Explore the enduring debate between using spaces and tabs for code indentation, and why this choice matters more than you might think.'}]

export function getBlogPosts(){
    return info;
}

export function formatDate(date: string, includeRelative = false) {
    const currentDate = new Date()
    if (!date.includes('T')) {
        date = `${date}T00:00:00`
    }
    const targetDate = new Date(date)

    const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
    const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
    const daysAgo = currentDate.getDate() - targetDate.getDate()

    let formattedDate = ''

    if (yearsAgo > 0) {
        formattedDate = `${yearsAgo}y ago`
    } else if (monthsAgo > 0) {
        formattedDate = `${monthsAgo}mo ago`
    } else if (daysAgo > 0) {
        formattedDate = `${daysAgo}d ago`
    } else {
        formattedDate = 'Today'
    }

    const fullDate = targetDate.toLocaleString('en-us', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    if (!includeRelative) {
        return fullDate
    }

    return `${fullDate} (${formattedDate})`
}
