import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Notification from "@/lib/models/Notification";
import { Notebook } from "@/lib/models/notebook";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mentionedNames, notebookId, commentText } = await req.json();

    await connectDB();

    const sender = await User.findOne({ clerkId: userId });
    if (!sender) return NextResponse.json({ ok: true }); // silent fail

    const notebook = await Notebook.findById(notebookId);
    const notebookTitle = notebook?.title || "a notebook";

    // Find mentioned users by name
    const mentionedUsers = await User.find({
      name: { $in: mentionedNames.map((n: string) => new RegExp(`^${n}$`, "i")) },
      _id: { $ne: sender._id },
    });

    if (mentionedUsers.length === 0) return NextResponse.json({ ok: true });

    // Create a notification for each mentioned user
    await Notification.insertMany(
      mentionedUsers.map((u: any) => ({
        recipient: u._id,
        type: "notebook_shared",
        title: `${sender.name} mentioned you`,
        message: `In "${notebookTitle}": ${commentText.slice(0, 120)}`,
        read: false,
        actionData: { notebookId },
      }))
    );

    return NextResponse.json({ ok: true, notified: mentionedUsers.length });
  } catch (error) {
    console.error("[Mention notification]", error);
    return NextResponse.json({ ok: true }); // never fail the client
  }
}
