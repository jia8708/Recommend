export default function Overview() {
    return (
        <div className="p-6 w-54 h-54 mr-8">
            <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#BBE0E3] mb-3"></div>
                <h2 className="text-lg font-semibold text-gray-800">Jia</h2>
            </div>

            <div className="flex justify-between text-center">
                <div>
                    <div className="text-sm text-gray-600 w-10">文章</div>
                    <div className="text-sm font-medium text-gray-800">10</div>
                </div>
                <div>
                    <div className="text-sm text-gray-600 w-10">标签</div>
                    <div className="text-sm font-medium text-gray-800">7</div>
                </div>
                <div>
                    <div className="text-sm text-gray-600 w-10">分类</div>
                    <div className="text-sm font-medium text-gray-800">4</div>
                </div>
            </div>
        </div>
    );
}