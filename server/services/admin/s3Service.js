import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

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
  const key = `categories/${imageName}`; // Folder structure in S3

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
