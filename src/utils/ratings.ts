export interface RatingStats {
  count: number;
  sum: number;
}

export const BASE_RATINGS: Record<string, RatingStats> = {
  "singleton": { count: 184, sum: 736 },      // 4.0 average
  "factory-method": { count: 142, sum: 639 },  // 4.5 average
  "builder": { count: 128, sum: 601 },         // 4.7 average
  "adapter": { count: 96, sum: 412 },          // 4.3 average
  "decorator": { count: 156, sum: 717 },       // 4.6 average
  "facade": { count: 198, sum: 950 },          // 4.8 average
  "observer": { count: 134, sum: 603 },         // 4.5 average
  "strategy": { count: 165, sum: 775 },        // 4.7 average
  "state": { count: 88, sum: 378 },            // 4.3 average
};

export interface PatternRatingInfo {
  average: number;
  count: number;
}

export function getAverageRating(patternId: string, userRating?: number): PatternRatingInfo {
  const base = BASE_RATINGS[patternId] || { count: 50, sum: 225 };
  if (userRating && userRating >= 1 && userRating <= 5) {
    const totalSum = base.sum + userRating;
    const totalCount = base.count + 1;
    return {
      average: Math.round((totalSum / totalCount) * 10) / 10,
      count: totalCount,
    };
  }
  return {
    average: Math.round((base.sum / base.count) * 10) / 10,
    count: base.count,
  };
}
