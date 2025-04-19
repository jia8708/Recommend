import { notFound } from 'next/navigation'
import {getLeaderInfo} from '../util'
import React from "react";
import IntroducePage from "@/app/leader/[slug]/introduce/page";

export default async function Page({ params }: { params: { slug: string } }) {
    const data = await params;
    const leader = await getLeaderInfo(data.slug);

    console.log('leader',leader);

    if (!leader) {
        notFound()
    }

    return (
        <section className="max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
            <IntroducePage/>
        </section>
    )
}
