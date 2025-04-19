import {Tag} from '@/app/tag/util'

export default function Tags({tags}: {tags: Tag[]}) {
    return (
        <div className="flex flex-row mt-8">
            <span className="basis-1/4 font-semibold text-[50px] text-center my-4 tracking-tighter">Tags</span>
            <div className="basis-3/4 grid grid-cols-3 gap-x-2 gap-y-1 p-2 mt-4 w-2/3 h-1/2 mx-auto items-baseline">
                {tags.map((tag) => (
                    <a
                        key={tag.name}
                        href={`/tag/${tag.name}`}
                        className="text-sm px-2 py-0.5 text-center rounded-full
                             transition-all hover:scale-105
                             whitespace-nowrap leading-tight
                             w-1/4"
                    >
                    <span className="text-[#f38181]">
                        {tag.name}
                    </span>
                        ({tag.count})
                    </a>
                ))}
            </div>
        </div>
    );
}