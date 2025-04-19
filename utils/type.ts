export interface Subjective {
    id:number;
    userId:number;
    q1:string;
    q2:string;
    q3:string;
    q4:string;
    q5:string;
    q6:string;
    q7:string;
    q8:string;
    q9:string;
    createTime:string;
    updateTime:string;
    isDelete:boolean;
}

export interface ServerResponse {
    userId: number;
    result:{name:string;}[];
    subjective:Subjective
}