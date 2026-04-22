export const TIERS = [
  { id: 0, name: "Arc Wanderer",    min: 0,  max: 2,  image: "/sbt-images/Arc Wanderer.png" },
  { id: 1, name: "Arc Scout",       min: 3,  max: 5,  image: "/sbt-images/Arc Scout.png" },
  { id: 2, name: "Arc Explorer",    min: 6,  max: 10, image: "/sbt-images/Arc Explorer.png" },
  { id: 3, name: "Arc Pathfinder",  min: 11, max: 15, image: "/sbt-images/Arc Pathfinder.png" },
  { id: 4, name: "Arc Trailblazer", min: 16, max: 19, image: "/sbt-images/Arc Trailblazer.png" },
  { id: 5, name: "Arc Legend",      min: 20, max: 20, image: "/sbt-images/Arc Legend.png" },
] as const;

export function getTierForScore(score: number) {
  return TIERS.find((t) => score >= t.min && score <= t.max) ?? TIERS[0];
}
