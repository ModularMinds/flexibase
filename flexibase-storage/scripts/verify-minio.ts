import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

// MinIO Config (defaults to standard local MinIO if not provided)
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "http://localhost:9000";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin";
const BUCKET_NAME = "test-verification-bucket";

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
});

async function run() {
  console.log("Starting MinIO verification...");
  console.log(`Endpoint: ${MINIO_ENDPOINT}`);

  // 1. Ensure Bucket
  try {
    console.log(`Checking bucket ${BUCKET_NAME}...`);
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`Bucket ${BUCKET_NAME} exists.`);
  } catch (e: any) {
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket ${BUCKET_NAME} does not exist. Creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log("Bucket created.");
    } else {
      console.error("Error checking bucket:", e);
      throw e;
    }
  }

  // 2. Upload File
  const key = `test-${Date.now()}.txt`;
  const content = "Hello from Verification Script";
  console.log(`Uploading ${key}...`);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
    }),
  );
  console.log("Upload successful.");

  // 3. Download File
  console.log(`Downloading ${key}...`);
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );

  const stream = response.Body as Readable;
  let data = "";
  for await (const chunk of stream) {
    data += chunk;
  }

  if (data !== content) {
    throw new Error(`Content mismatch! Expected '${content}', got '${data}'`);
  }
  console.log(`Download successful. Content matches: '${data}'`);

  // 4. Delete File
  console.log(`Deleting ${key}...`);
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  );
  console.log("Delete successful.");

  console.log("MinIO Verification PASSED!");
}

run().catch((err) => {
  console.error("Verification FAILED:", err);
  process.exit(1);
});
