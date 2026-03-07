import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Workspace } from "@/lib/models/workspace";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { inviteCode } = await req.json();
    if (!inviteCode) return NextResponse.json({ error: "Invite code required" }, { status: 400 });

    await connectDB();

    const ws = await Workspace.findOne({ inviteCode });
    if (!ws) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

    const alreadyMember = ws.members.some((m) => m.userId === userId);
    if (alreadyMember) return NextResponse.json({ workspace: ws });

    const user = await User.findOne({ clerkId: userId });

    ws.members.push({
      userId,
      role: "viewer",
      joinedAt: new Date(),
      name: user?.name,
      email: user?.email,
      avatar: user?.avatar ?? undefined,
    });

    await ws.save();
    return NextResponse.json({ workspace: ws });
  } catch (error) {
    console.error("[Workspace join]", error);
    return NextResponse.json({ error: "Failed to join workspace" }, { status: 500 });
  }
}
