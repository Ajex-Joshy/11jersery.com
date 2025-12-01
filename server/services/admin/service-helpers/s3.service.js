import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../../../config/logger.js";
import { env } from "../../../config/env.js";

const bucketName = env.AWS_S3_BUCKET_NAME;
const region = env.AWS_S3_REGION;
const accessKeyId = env.AWS_ACCESS_KEY_ID;
const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
const expiresIn = env.S3_EXPIRE_TIMIE;

// 2. Create the S3 Client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// 3. Create a unique file name
const randomImageName = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

export const uploadFileToS3 = async (file) => {
  const imageName = randomImageName();
  const key = `images/${imageName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
    return imageName;
  } catch (error) {
    throw error;
  }
};

export const getSignedUrlForKey = async (key) => {
  if (!key) return null;
  const k = `images/${key}`;
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: k,
  });

  try {
    const url = await getSignedUrl(s3Client, command, {
      expiresIn,
    });
    return url;
  } catch (error) {
    logger.error(`Error generating signed URL for key ${key}:`, error);
    return null;
  }
};
