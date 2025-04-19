

export type Comment = {
    id:number,
    content: string,
    createTime: string,
    postId: number,
    thumbNum: number,
    userId: number,
    updateTime: string
    hasThumb: boolean
}

export interface Post {
    id: number;
    title: string;
    content: string;
    summary: string;
    user: {
        id:number;
        userName: string;
        userAvatar: string;
    };
    thumbNum: number;
    commentsVOS: Comment[];
    createTime:string;
    tags: string[];
    hasThumb: boolean;
}

export interface User {
    id: number;
    userName: string;
    userAvatar: string;
    userProfile: string;
    userRole: string;
}

