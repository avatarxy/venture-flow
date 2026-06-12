import { NextResponse } from "next/server"
import { publishCurrentBuildPreview } from "@/server/versions/version-repository"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params

  try {
    const version = await publishCurrentBuildPreview(projectId)
    const origin = new URL(request.url).origin

    return NextResponse.json({
      projectId,
      versionId: version.id,
      previewUrl: `${origin}/preview/${projectId}/${version.id}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成预览链接失败"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
