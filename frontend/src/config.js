/**
 * Configuration file for frontend - handles both local and AWS deployments
 */

const development = {
  apiUrl: 'http://localhost:5000'
};

const production = {
  // This will be updated to your EC2 instance URL or load balancer URL when deployed
  apiUrl: process.env.REACT_APP_API_URL || 'https://your-ec2-instance.aws-region.compute.amazonaws.com',
  // This will be your S3 bucket URL when deployed
  s3BucketUrl: process.env.REACT_APP_S3_URL || 'https://task-manager-uploads.s3.aws-region.amazonaws.com'
};

const config = process.env.NODE_ENV === 'production' ? production : development;

export default config;
