"use client";

import { EngagementData } from "@/hooks/use-analytics";

interface EngagementChartProps {
  data: EngagementData[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            No engagement data available
          </div>
        </div>
      </div>
    );
  }

  // Find max values for scaling
  const maxViews = Math.max(...data.map(d => d.views));
  const maxEngagement = Math.max(...data.map(d => d.totalEngagement));
  const maxValue = Math.max(maxViews, maxEngagement);

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Views</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Engagement (Likes + Comments)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3 max-h-[160px] overflow-y-auto">
        {data.map((post) => (
          <div key={post.id} className="space-y-1">
            {/* Post title */}
            <div className="text-xs font-medium text-gray-700 truncate" title={post.fullTitle}>
              {post.title}
            </div>

            {/* Bars */}
            <div className="space-y-1">
              {/* Views bar */}
              <div className="flex items-center gap-2">
                <div className="w-12 text-xs text-gray-500">Views</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: maxValue > 0 ? `${(post.views / maxValue) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
                <div className="w-8 text-xs text-gray-600 text-right">{post.views}</div>
              </div>

              {/* Engagement bar */}
              <div className="flex items-center gap-2">
                <div className="w-12 text-xs text-gray-500">Eng.</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: maxValue > 0 ? `${(post.totalEngagement / maxValue) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
                <div className="w-8 text-xs text-gray-600 text-right">{post.totalEngagement}</div>
              </div>
            </div>

            {/* Engagement rate */}
            <div className="text-xs text-gray-500 text-right">
              {post.engagementRate}% engagement rate
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-2 border-t text-xs text-gray-500">
        Showing top {data.length} posts by views
      </div>
    </div>
  );
}
