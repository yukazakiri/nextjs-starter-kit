import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { uploadFileToR2 } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId: classIdParam } = await params;
    const classId = parseInt(classIdParam);

    const announcements = await prisma.announcements.findMany({
      where: {
        class_id: classId,
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedAnnouncements = announcements.map((a) => ({
      id: a.id.toString(),
      content: a.content,
      authorName: a.users.name || a.users.email || "Unknown",
      date: a.created_at,
      attachments: a.attachments ? (a.attachments as any) : [],
    }));

    return NextResponse.json({ announcements: formattedAnnouncements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user email from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Find faculty by email
    const faculty = await prisma.faculty.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const { classId: classIdParam } = await params;
    const classId = parseInt(classIdParam);

    // Verify the faculty owns this class
    const classExists = await prisma.classes.findFirst({
      where: {
        id: classId,
        faculty_id: faculty.id,
      },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: "Class not found or you don't have permission" },
        { status: 403 }
      );
    }

    // Get or create user in users table
    let user = await prisma.users.findFirst({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      // Create user if doesn't exist
      const fullName = `${faculty.first_name} ${faculty.last_name}`.trim();
      user = await prisma.users.create({
        data: {
          name: fullName,
          email: faculty.email,
        },
      });
    }

    const formData = await request.formData();
    const content = formData.get("content") as string;
    const files = formData.getAll("files") as File[];

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const attachments = [];

    // Check if R2 is configured
    const r2Configured =
      process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.R2_UPLOAD_IMAGE_ACCESS_KEY_ID &&
      process.env.R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY &&
      process.env.R2_UPLOAD_IMAGE_BUCKET_NAME;

    if (files.length > 0 && !r2Configured) {
      return NextResponse.json(
        { error: "File uploads are not configured. Please set up R2 environment variables." },
        { status: 503 }
      );
    }

    for (const file of files) {
      try {
        const key = await uploadFileToR2(file);
        const url = `https://pub-057d9a55925d4b4fa466a5269d86b4ef.r2.dev/${key}`;

        attachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          key: key,
          url: url
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
          { error: "Failed to upload file. Please check R2 configuration." },
          { status: 500 }
        );
      }
    }

    const announcement = await prisma.announcements.create({
      data: {
        content,
        title: "Announcement", // Default title
        slug: `announcement-${Date.now()}`,
        status: "published",
        user_id: user.id,
        class_id: classId,
        attachments: attachments,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Convert BigInt fields to strings for JSON serialization
    const serializedAnnouncement = {
      id: announcement.id.toString(),
      content: announcement.content,
      title: announcement.title,
      createdAt: announcement.created_at,
      attachments: announcement.attachments,
    };

    return NextResponse.json({ success: true, announcement: serializedAnnouncement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
