export class SurveyDB {
    private dbName: string;
    private dbVersion: number;
    private db: IDBDatabase | null = null;

    constructor() {
        this.dbName = 'SurveyDatabase';
        this.dbVersion = 1;
    }

    //打开db
    async openDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Database error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = request.result;
                if (!db.objectStoreNames.contains('surveyResults')) {
                    const store = db.createObjectStore('surveyResults', {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    //存储结果
    async saveSurveyResult(data: {
        userAnswers: Record<string, string[] | string>;
        serverResponse: any;
    }): Promise<number> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('surveyResults', 'readwrite');
            const store = transaction.objectStore('surveyResults');

            const record = {
                ...data,
                timestamp: new Date().getTime(),
            };

            const request = store.add(record);

            request.onsuccess = () => {
                resolve(request.result as number);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    //获取所有结果
    async getAllResults(): Promise<
        Array<{
            id: number;
            userAnswers: Record<string, string[] | string>;
            serverResponse: any;
            timestamp: number;
        }>
    > {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('surveyResults', 'readonly');
            const store = transaction.objectStore('surveyResults');
            const index = store.index('timestamp');
            const request = index.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

export const surveyDB = new SurveyDB();