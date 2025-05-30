"use client";

import { CategoryDistribution } from "@/hooks/use-analytics";

interface CategoryChartProps {
  data: CategoryDistribution[];
}

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-teal-500',
  'bg-cyan-500'
];

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            No category data available
          </div>
        </div>
      </div>
    );
  }

  const totalPosts = data.reduce((sum, cat) => sum + cat.postCount, 0);

  const maxCount = Math.max(...data.map(d => d.postCount));

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold">{totalPosts}</div>
        <div className="text-sm text-gray-500">Total Posts</div>
        <div className="text-xs text-gray-400">{data.length} Categories</div>
      </div>

      {/* Category Bars */}
      <div className="space-y-3 max-h-[120px] overflow-y-auto">
        {data.map((category, index) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate flex-1" title={category.name}>
                {category.name}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{category.postCount} posts</span>
                <span className="w-10 text-right font-medium">{category.percentage}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${COLORS[index % COLORS.length]}`}
                  style={{
                    width: maxCount > 0 ? `${(category.postCount / maxCount) * 100}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-2 border-t text-xs text-gray-500 text-center">
        Distribution of posts across categories
      </div>
    </div>
  );
}


