import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../../../config/logger.js";

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_S3_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

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
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    logger.error(`Error generating signed URL for key ${key}:`, error);
    return null;
  }
};
