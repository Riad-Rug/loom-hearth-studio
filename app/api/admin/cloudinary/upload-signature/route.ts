import { NextResponse } from "next/server";

import { requireAdminRoleForMutation } from "@/lib/auth/service";
import { getCloudinaryConfig } from "@/lib/cloudinary/config";
import { signCloudinaryUploadParams } from "@/lib/cloudinary/server";
import type { CloudinarySignedUploadRequest } from "@/lib/cloudinary/types";

function isUploadTarget(value: string): value is CloudinarySignedUploadRequest["target"] {
  return value === "homepage" || value === "rug" || value === "multiUnit";
}

export async function POST(request: Request) {
  const permission = await requireAdminRoleForMutation();

  if (permission.status !== "allowed") {
    return NextResponse.json(
      {
        status: "forbidden",
        message: "An admin role is required before media uploads can be signed.",
      },
      { status: 403 },
    );
  }

  const payload = (await request.json()) as Partial<CloudinarySignedUploadRequest> & {
    productType?: string;
  };
  const target = typeof payload.target === "string"
    ? payload.target
    : typeof payload.productType === "string"
      ? payload.productType
      : "";

  if (!isUploadTarget(target)) {
    return NextResponse.json(
      {
        status: "invalid-input",
        message: "A supported upload target is required before media uploads can be signed.",
      },
      { status: 400 },
    );
  }

  const config = getCloudinaryConfig();

  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    return NextResponse.json(
      {
        status: "configuration-error",
        message: "Cloudinary environment variables are missing for signed uploads.",
      },
      { status: 503 },
    );
  }

  const folder =
    target === "homepage"
      ? config.folders.homepage
      : target === "rug"
        ? config.folders.productsRugs
        : config.folders.productsMultiUnit;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryUploadParams(
    {
      folder,
      timestamp,
    },
    config.apiSecret,
  );

  return NextResponse.json({
    status: "ready",
    payload: {
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      timestamp,
      folder,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    },
  });
}
