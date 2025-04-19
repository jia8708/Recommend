export interface Tag {
    name: string;
    count: number;
    title: string;
}

const tags:Tag[]=[
    { name: 'computer', count: 38,title:'计算机' },
    { name: 'data', count: 30,title:'大数据' },
    { name: 'science', count: 28 ,title:'智能科学'}
]

export const tagMap = {
    'computer': '计算机',
    'data': '大数据',
    'science': '智能科学'
} as const;

export type TagKey = keyof typeof tagMap;
export type TagValue = typeof tagMap[TagKey];

export function getTags(){
    return tags;
}