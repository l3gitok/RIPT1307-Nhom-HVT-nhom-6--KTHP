// controllers/upload.controller.js
exports.uploadImage = async (req, res) => {
  try {
    const imageUrl = req.file.path; // URL do Cloudinary trả về
    res.status(200).json({ url: imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};
