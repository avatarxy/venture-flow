import { z } from "zod"

export const optimizationFindingSchema = z.object({
  title: z.string().min(1),
  evidence: z.array(z.string()).min(1),
  inference: z.string().min(1),
})

export const optimizationRecommendationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]),
  evidence: z.array(z.string()).min(1),
  inference: z.string().min(1),
  expectedImpact: z.string().min(1),
  targetComponents: z.array(z.string()).min(1),
})

export const optimizationOutputSchema = z.object({
  findings: z.array(optimizationFindingSchema),
  recommendations: z.array(optimizationRecommendationSchema).min(1),
})

export type OptimizationFinding = z.infer<typeof optimizationFindingSchema>
export type OptimizationRecommendation = z.infer<typeof optimizationRecommendationSchema>
export type OptimizationOutput = z.infer<typeof optimizationOutputSchema>
