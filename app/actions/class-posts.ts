"use server";

import { laravelApi } from "@/lib/laravel-api";
import { revalidatePath } from "next/cache";

export async function getClassPostsAction(classId: string) {
  try {
    const response = await laravelApi.getClassPosts(classId);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching class posts:", error);
    return { success: false, error: "Failed to fetch class posts" };
  }
}

export async function createClassPostAction(
  classId: string,
  content: string,
  attachments: any[] = []
) {
  try {
    const formData = new FormData();
    formData.append("class_id", classId);
    formData.append("content", content);
    formData.append("type", "announcement"); // Defaulting to announcement for now
    formData.append("title", "Announcement"); // Default title

    // If the backend expects attachments as a JSON string or individual fields
    // I'll try sending them as a JSON string first, or individual array items if that's standard
    // Assuming the backend can handle 'attachments' as a JSON string of metadata
    // OR it might expect 'attachment_urls', 'attachment_names', etc.
    // Given the lack of backend docs, I'll try to send the attachments as a JSON string
    // which is a common pattern for sending complex data in FormData
    if (attachments.length > 0) {
       formData.append("attachments", JSON.stringify(attachments));
    }

    const response = await laravelApi.createClassPost(formData);
    
    revalidatePath(`/dashboard/faculty/classes/${classId}`);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error creating class post:", error);
    return { success: false, error: "Failed to create class post" };
  }
}

export async function deleteClassPostAction(postId: string, classId: string) {
  try {
    await laravelApi.deleteClassPost(postId);
    revalidatePath(`/dashboard/faculty/classes/${classId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting class post:", error);
    return { success: false, error: "Failed to delete class post" };
  }
}

export async function updateClassPostAction(
  postId: string,
  classId: string,
  content: string,
  attachments: any[] = []
) {
  try {
    await laravelApi.updateClassPost(postId, { 
      content,
      class_id: classId,
      title: "Announcement",
      type: "announcement",
      attachments: attachments
    });
    
    revalidatePath(`/dashboard/faculty/classes/${classId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating class post:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update class post" 
    };
  }
}

export async function uploadPostAttachmentAction(postId: string, formData: FormData) {
  try {
    await laravelApi.addClassPostAttachment(postId, formData);
    return { success: true };
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to upload attachment" 
    };
  }
}
