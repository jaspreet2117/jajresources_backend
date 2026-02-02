import cloudinary from "../config/cloudinaryConfig";

type UploadFile = {
  buffer: Buffer;
  mimetype: string;
};

export type ImageResource = {
  public_id: string;
  secure_url: string;
  tags: string[];
  instrument_name?: string;
};

const CACHE_TIME = 60 * 60 * 1000;

let imageCache: {
  data: ImageResource[];
  time: number;
} | null = null;

/* ================= FETCH IMAGES================= */
export const fetchImages = async (): Promise<ImageResource[]> => {
  try {
    if (imageCache && Date.now() - imageCache.time < CACHE_TIME) {
      return imageCache.data;
    }

    const response = await cloudinary.api.resources({
      resource_type: "image",
      max_results: 500,
      context: true,
      tags: true,
    });

    const images: ImageResource[] = (response.resources || []).map(
      (img: any) => ({
        public_id: img.public_id,
        secure_url: img.secure_url,
        tags: img.tags || [],
        instrument_name:
          img.context?.custom?.instrument_name ||
          img.context?.instrument_name,
      })
    );

    imageCache = {
      data: images,
      time: Date.now(),
    };

    return images;
  } catch (error) {
    console.error("Error fetching images:", error);
    return imageCache?.data || [];
  }
};

/* ================= UPLOAD IMAGE ================= */
export const uploadImage = async ({
  file,
  url,
  tags,
  instrument_name,
}: {
  file?: UploadFile;
  url?: string;
  tags?: string[];
  instrument_name?: string;
}): Promise<ImageResource> => {
  const source = file
    ? `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    : (url as string);

  const result = await cloudinary.uploader.upload(source, {
    resource_type: "image",
    tags: tags && tags.length ? tags : undefined,
    context: instrument_name ? { instrument_name } : undefined,
  });

  imageCache = null;

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    tags: result.tags || [],
    instrument_name: (result.context as any)?.custom?.instrument_name,
  };
};

/* ================= UPDATE TAGS ================= */
export const updateImageMetadata = async (
  publicId: string,
  { tags, instrument_name }: { tags?: string[]; instrument_name?: string }
): Promise<ImageResource> => {
  
  const result = await cloudinary.uploader.explicit(publicId, {
    type: "upload",
    tags: tags,
    // Store the name in Cloudinary context
    context: instrument_name ? { instrument_name: instrument_name } : undefined,
    console:("done")
  });

  imageCache = null;

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    tags: result.tags || [],
    instrument_name: result.context?.custom?.instrument_name,
  };
};

/* ================= DELETE IMAGE ================= */
export const deleteImage = async (publicId: string) => {

  imageCache = null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};
