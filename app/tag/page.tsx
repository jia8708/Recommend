import {getTags} from "@/app/tag/util";
import Tags from "@/components/tags";

export default function Page() {
    return (
        <section>
            <Tags tags={getTags()} />
        </section>
    );
}