import React from 'react';
import Link from 'next/link';
import { getLeaders } from '@/app/leader/util';
import { LeaderCard } from '@/components/leaderCard'

const HomeList =async () => {
    const leaders =await getLeaders();

    if(leaders && leaders.length > 0){
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {leaders.slice(0,8).map((leader) => (
                        <LeaderCard
                            key={leader.name}
                            leader={leader}
                        />
                    ))}
                </div>

                {leaders.length > 4 && (
                    <div className="mt-8 text-right">
                        <Link
                            href="/leader"
                            className="inline-block px-6 py-2 text-sky-500 hover:text-sky-700 font-medium transition-colors"
                        >
                            查看全部师资 →
                        </Link>
                    </div>
                )}
            </div>
        );
    }else{
        return <div></div>
    }
};

export default HomeList;