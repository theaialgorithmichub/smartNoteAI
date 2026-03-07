import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Workspace, WorkspaceRole } from "@/lib/models/workspace";
import User from "@/lib/models/User";

type Params = { params: Promise<{ id: string }> };

function canManage(role: WorkspaceRole) {
  return role === "owner" || role === "admin";
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const ws = await Workspace.findById(id).lean();
    if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const isMember = ws.ownerId === userId || ws.members.some((m) => m.userId === userId);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json(ws);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const ws = await Workspace.findById(id);
    if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const member = ws.members.find((m) => m.userId === userId);
    if (!member || !canManage(member.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (body.name !== undefined) ws.name = body.name;
    if (body.description !== undefined) ws.description = body.description;
    if (body.isPublic !== undefined) ws.isPublic = body.isPublic;

    // Update member role
    if (body.updateMember) {
      const { memberId, role } = body.updateMember;
      if (member.role !== "owner") return NextResponse.json({ error: "Only owner can change roles" }, { status: 403 });
      const target = ws.members.find((m) => m.userId === memberId);
      if (target && target.role !== "owner") target.role = role;
    }

    // Remove member
    if (body.removeMember) {
      if (!canManage(member.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      ws.members = ws.members.filter((m) => m.userId !== body.removeMember || m.role === "owner");
    }

    // Add notebook
    if (body.addNotebookId) {
      if (!ws.notebookIds.map(String).includes(body.addNotebookId)) {
        ws.notebookIds.push(body.addNotebookId);
      }
    }

    // Remove notebook
    if (body.removeNotebookId) {
      ws.notebookIds = ws.notebookIds.filter((n) => n.toString() !== body.removeNotebookId);
    }

    await ws.save();
    return NextResponse.json(ws);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const ws = await Workspace.findById(id);
    if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (ws.ownerId !== userId) return NextResponse.json({ error: "Only owner can delete" }, { status: 403 });
    await ws.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
