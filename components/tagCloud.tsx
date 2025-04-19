import {Tag} from '@/app/tag/util'

export default function TagCloud({ tags }:{tags:Tag[]}) {
    // 根据 count 生成随机字体大小（示例逻辑）
    const getSize = (count:number) => {
        const baseSize = 1; // 基准字号
        return baseSize + Math.log(count) * 3;
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 justify-center border-1 border-[#BBE0E3] rounded-md mt-4 w-54">
            {tags.map((tag) => (
                <a
                    key={tag.name}
                    href={`/tag/${tag.name}`}
                    className="px-1 py-1 rounded-full transition-all hover:scale-105"
                    style={{
                        fontSize: `${getSize(tag.count)}px`,
                        color: `rgba(243, 129, 129, ${tag.count / 50})` // 薄荷绿渐变
                    }}
                >
                    {tag.name} ({tag.count})
                </a>
            ))}
        </div>
    );
}