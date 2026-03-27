export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface StorageProvider {
  generatePresignedUploadUrl(
    fileName: string,
    contentType: string,
    websiteId: string,
  ): Promise<PresignedUrlResult>;

  deleteObject(key: string): Promise<void>;
}
