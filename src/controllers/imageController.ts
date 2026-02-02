import { Request, Response, NextFunction } from "express";
import * as cloudinaryService from "../services/cloudinaryService";

export const getImages = async (req: Request, res: Response) => {
  const { tag } = req.params; 
  const images = await cloudinaryService.fetchImages();
  
  let filteredImages = images;
  if (tag) {
    filteredImages = images.filter(img => 
      img.tags.includes(tag.toLowerCase())
    );
  }
  const responseData = filteredImages.map(img => ({
    ...img,
    display_name: img.instrument_name || img.public_id
  }));

  res.json({ success: true, images: responseData });
};
      
export const addImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags, url, name } = req.body;

    // console.log("=== ADD IMAGE REQUEST ===");
    // console.log("Request body:", req.body);
    // console.log("Tags received:", tags);
    // console.log("Name received:", name);
    // console.log("URL received:", url);

    if (!req.file && !url) {
      return res.status(400).json({ success: false, message: "File or URL required" });
    }

    // Parse tags - handle both string and array formats
    let tagsArr: string[] = [];
    if (typeof tags === "string") {
      tagsArr = tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    } else if (Array.isArray(tags)) {
      tagsArr = tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
      // console.log("Parsed array tags:", tagsArr);
    }

    // Debug: check if tags are being parsed
    if (tagsArr.length === 0 && tags) {
      console.warn("⚠️ Tags provided but not parsed correctly:", tags);
    }

    console.log(" tagsArr:", tagsArr);

    const image = await cloudinaryService.uploadImage({
      file: req.file,
      url,
      tags: tagsArr,
      instrument_name: name,
    });

    res.status(201).json({ success: true, image, tags: tagsArr });
  } catch (err) {
    next(err);
  }
};
 
export const updateImage = async (req: Request, res: Response) => {
  const { publicId } = req.params;

  const { tags, instrument_name } = req.body; 

  let tagsArr: string[] = [];
  if (typeof tags === "string") {
    tagsArr = tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
  } else if (Array.isArray(tags)) {
    tagsArr = tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
  }

console.log("Updating image with tags:", tagsArr, "and instrument_name:", instrument_name);
  const updated = await cloudinaryService.updateImageMetadata(publicId, { 
    tags: tagsArr,
   instrument_name
  });

  res.json({ success: true, updated });
};
export const deleteImage = async (req: Request, res: Response) => {
  await cloudinaryService.deleteImage(req.params.publicId);
  res.json({ success: true });
};
