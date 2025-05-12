import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Schema for profile update
const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  image: z.string().nullable().optional(),
  bio: z.string().max(500, "Bio is too long").nullable().optional(),
  location: z.string().max(100, "Location is too long").nullable().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    // Verify the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    // Extract and prepare data for update
    const { name, image, bio, location } = validationResult.data;

    // Prepare update data, handling null/undefined values properly
    const updateData = {
      name,
      ...(image !== undefined ? { image: image === "" ? null : image } : {}),
      ...(bio !== undefined ? { bio: bio === "" ? null : bio } : {}),
      ...(location !== undefined ? { location: location === "" ? null : location } : {})
    };

    // Update user profile
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      });

      return NextResponse.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (dbError) {
      console.error("Database error updating profile:", dbError);
      return NextResponse.json(
        { error: "Failed to update profile in database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
