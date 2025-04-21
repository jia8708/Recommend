import {baseUrl} from "@/utils/constance";
import {getSession} from "next-auth/react";

interface Project {
    id: string;
    mentor_id: string;
    project: string;
}

export type LeaderInfo = {
    id: string;
    name: string;
    image: string;
    specialty: string;
    mentor_msg: string;
    research: string;
    mentor_job: string;
    employment: string | null;
    projects: Project[];
}

export type Leader = {
    id: string;
    name: string;
    image: string;
    specialty: string;
    mentor_msg: string;
    research: string;
}

const session = await getSession();

export async function getLeaders(): Promise<Leader[] | null> {
    try {
        const response = await fetch(baseUrl+'/mentor/specialty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': `${session?.accessToken}`
            },
            body: JSON.stringify({
                "pageSize": 100
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if(data.code === 0){
            return data.data.records; // 直接返回数据，不是 Promise
        }
        return null;
    } catch (error) {
        console.error('Error fetching mentor data:', error);
        throw error; // 抛出错误让调用方处理
    }
}

export async function getLeaderInfo(id: string): Promise<LeaderInfo | null> {
    try {
        const response = await fetch(baseUrl+'/mentor/getById?id='+id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': `${session?.accessToken}`
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if(data.code === 0){
            //console.log("getLeaderInfo", data.data);
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching mentor data:', error);
        throw error; // 抛出错误让调用方处理
    }
}


export type Metadata = {
    title: string
    publishedAt: string
    summary: string
    image?: string
}




