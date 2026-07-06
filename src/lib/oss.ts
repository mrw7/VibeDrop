import OSS from "ali-oss"

const client = new OSS({
  region: process.env.OSS_REGION!,
  bucket: process.env.OSS_BUCKET!,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
})

export async function uploadToOSS(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const result = await client.put(key, buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
    },
  })
  return result.url
}

export async function generatePresignedUrl(
  key: string,
  expires: number = 3600
): Promise<string> {
  const url = client.signatureUrl(key, {
    expires,
    method: "PUT",
  })
  return url
}

export function getOSSUrl(key: string): string {
  return `https://${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com/${key}`
}
