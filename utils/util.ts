import {baseUrl} from "@/utils/constance";
import {getSession} from "next-auth/react";

export function formatDate(date:Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    //const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export async function getImage(imgId: string): Promise<string> {
    const session = await getSession();
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/mentor/download?fileName=`+imgId, {
            method: 'GET',
            headers: {
                'token': `${session?.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Image request failed with status ${response.status}`);
        }

        //检查响应内容类型是否为图片
        const contentType = response.headers.get('content-type');
        if (!contentType?.startsWith('image/')) {
            throw new Error('Response is not an image');
        }

        // 将响应转换为 Blob
        const blob = await response.blob();

        // 创建对象 URL
        const imageUrl = URL.createObjectURL(blob);

        return imageUrl;

    } catch (error) {
        console.error('Error fetching image:', error);
        return '/img/people.png';
    }
}
