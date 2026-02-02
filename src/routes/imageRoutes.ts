import express from "express";
import multer from "multer";
import {
  getImages,
  addImage,
  updateImage,
  deleteImage,
} from "../controllers/imageController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* GET all images OR page-wise images */
router.get("/:tag", getImages);   
router.get("/", getImages);   

router.post("/", upload.single("file"), addImage);
router.put("/:publicId", updateImage);
router.delete("/:publicId", deleteImage);

export default router;
