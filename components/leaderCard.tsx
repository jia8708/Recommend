'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from 'antd';
import {Leader} from "@/app/leader/util";
import { usePathname } from 'next/navigation';
import {useEffect,useState} from "react";
import {getImage} from "@/utils/util";

const { Meta } = Card;

interface LeaderCardProps {
    leader: Leader
}

export const LeaderCard = ({ leader }: LeaderCardProps) => {
    const pathname = usePathname();
    const isLeaderRoute = !!pathname[1];

    const [imageUrl, setImageUrl] = useState('/img/people.png');

    useEffect(() => {
        const fetchImage = async () => {
            try {
                //console.log('leaderCard leader',leader,leader.image)
                const url = await getImage(leader.image);
                setImageUrl(url);
            } catch (error) {
                console.error('Failed to load avatar:', error);
            }
        };

        fetchImage();

        // 清理函数，避免内存泄漏
        return () => {
            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [leader]);

    if (isLeaderRoute) {
        return (
            <Link
                href={`/leader/${leader.id}`}
                className="block group"
                passHref
                legacyBehavior
            >
                <div className="flex items-stretch border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 h-full">
                    {/* 左侧内容（图片、名字、专业） */}
                    <div className="w-1/3 flex-shrink-0 relative">
                        <div className="flex flex-col justify-center items-center p-4">
                            {/* 图片 */}
                            <img
                                alt={leader.name}
                                src={imageUrl}
                                className="w-24 h-24 object-cover rounded-full mb-4"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/img/people.png';
                                }}
                            />
                            {/* 名字和专业 */}
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#f38181] transition-colors mb-2">
                                    {leader.name}
                                </h3>
                                <p className="text-sm text-gray-600">{leader.specialty}</p>
                            </div>
                        </div>
                    </div>

                    {/* 右侧内容（个人介绍） */}
                    <div className="w-1/2 p-4 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">{leader.research}</p>
                    </div>
                </div>
            </Link>
        );
    }
    return (
        <Link
            href={`/leader/${leader.id}`}
            passHref
            legacyBehavior
        >
            <Card
                hoverable
                className="w-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                cover={
                    <img
                        alt={leader.name}
                        src={imageUrl}
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/img/people.png';
                        }}
                    />
                }
            >
                <Meta
                    title={<span className="text-lg font-semibold">{leader.name}</span>}
                    description={<span className="text-gray-600">{leader.specialty}</span>}
                />
            </Card>
        </Link>
    );
};