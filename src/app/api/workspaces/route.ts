import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Workspace } from "@/lib/models/workspace";
import User from "@/lib/models/User";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const workspaces = await Workspace.find({
      $or: [{ ownerId: userId }, { "members.userId": userId }],
    }).lean();

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("[Workspaces GET]", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    await connectDB();

    const user = await User.findOne({ clerkId: userId });

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim(),
      ownerId: userId,
      inviteCode: nanoid(10),
      members: [{
        userId,
        role: "owner",
        joinedAt: new Date(),
        name: user?.name,
        email: user?.email,
        avatar: user?.avatar,
      }],
      notebookIds: [],
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("[Workspaces POST]", error);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
