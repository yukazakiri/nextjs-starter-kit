import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    console.log("[CLASS SCHEDULE API] Fetching schedule for class:", classId);

    // Get schedules for this class
    const schedules = await prisma.schedule.findMany({
      where: {
        class_id: BigInt(classId),
        deleted_at: null,
      },
      orderBy: [
        { day_of_week: "asc" },
        { start_time: "asc" },
      ],
    });

    console.log("[CLASS SCHEDULE API] Found schedules:", schedules.length);

    // Get rooms
    const roomIds = schedules
      .map((s) => s.room_id)
      .filter((id): id is bigint => id !== null);

    const rooms = await prisma.rooms.findMany({
      where: {
        id: {
          in: roomIds,
        },
      },
    });

    const roomMap = new Map(rooms.map((r) => [r.id.toString(), r]));

    // Format schedule data
    const scheduleData = schedules.map((schedule) => {
      const room = schedule.room_id
        ? roomMap.get(schedule.room_id.toString())
        : null;

      const formatTime = (date: Date) => {
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      };

      return {
        id: schedule.id.toString(),
        dayOfWeek: schedule.day_of_week,
        startTime: formatTime(schedule.start_time),
        endTime: formatTime(schedule.end_time),
        room: room ? `${room.name}` : "TBA",
      };
    });

    console.log("[CLASS SCHEDULE API] Processed schedule data:", scheduleData.length);

    return NextResponse.json({
      success: true,
      schedule: scheduleData,
    });
  } catch (error) {
    console.error("[CLASS SCHEDULE API] Error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching schedule" },
      { status: 500 }
    );
  }
}
