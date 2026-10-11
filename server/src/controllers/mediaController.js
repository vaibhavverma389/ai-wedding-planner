import { uploadBufferToCloudinary, deleteMediaFromCloudinary } from '../utils/mediaUploader.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No media file provided', 400, 'FILE_MISSING');
    }

    const folder = req.body.folder || 'shaadisaathi/listings';
    const result = await uploadBufferToCloudinary(req.file.buffer, folder, req.file.mimetype);

    return sendSuccess(
      res,
      {
        url: result.url,
        publicId: result.publicId,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        sizeBytes: req.file.size
      },
      'File uploaded successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return sendError(res, 'publicId is required', 400, 'PARAM_MISSING');
    }

    await deleteMediaFromCloudinary(publicId);
    return sendSuccess(res, null, 'Media deleted successfully');
  } catch (err) {
    next(err);
  }
};
