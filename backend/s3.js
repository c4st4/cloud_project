const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Initialize S3 client
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

/**
 * Uploads a file to S3 bucket
 * @param {Object} file - The multer file object
 * @param {string} folder - Optional folder inside bucket
 * @returns {Promise<string>} - Returns the URL of the uploaded file
 */
const uploadToS3 = async (file, folder = 'uploads') => {
  try {
    // For local development, if no AWS config is present, return local path
    if (!process.env.S3_BUCKET || !process.env.AWS_REGION) {
      return `/uploads/${file.filename}`;
    }
    
    const fileContent = fs.readFileSync(file.path);
    const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };
    
    const result = await s3.upload(params).promise();
    
    // Remove local file after upload to S3
    fs.unlinkSync(file.path);
    
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

module.exports = { uploadToS3 };
