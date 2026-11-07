import { NextRequest, NextResponse } from "next/server"
import {
  recordPresence,
  removePresence,
  getPresenceStats,
} from "@/lib/security/presence-tracker"

export const dynamic = "force-dynamic"

export async function GET() {
  const stats = getPresenceStats()
  return NextResponse.json({
    success: true,
    ...stats,
  })
}

export async function POST(req: NextRequest) {
  try {
    let body: { sessionId?: string; isTyping?: boolean; leave?: boolean; action?: string } = {}
    try {
      const contentType = req.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        body = await req.json()
      } else {
        const text = await req.text()
        if (text) {
          body = JSON.parse(text)
        }
      }
    } catch {
      // Body might be empty or non-JSON
    }

    const sessionId =
      body.sessionId ||
      req.headers.get("x-session-id") ||
      req.cookies.get("betteririga_fw_session")?.value ||
      "anon_guest"

    if (body.leave || body.action === "leave") {
      const stats = removePresence(sessionId)
      return NextResponse.json({
        success: true,
        ...stats,
      })
    }

    const isTyping = Boolean(body.isTyping)
    const stats = recordPresence(sessionId, isTyping)

    return NextResponse.json({
      success: true,
      ...stats,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        liveCount: 1,
        typingCount: 0,
      },
      { status: 200 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const sessionId =
      url.searchParams.get("sessionId") ||
      req.headers.get("x-session-id") ||
      req.cookies.get("betteririga_fw_session")?.value

    if (sessionId) {
      removePresence(sessionId)
    }

    return NextResponse.json({
      success: true,
      ...getPresenceStats(),
    })
  } catch {
    return NextResponse.json({
      success: true,
      ...getPresenceStats(),
    })
  }
}
