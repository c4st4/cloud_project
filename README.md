# AWS Deployment Guide for Task Manager Application

This guide will walk you through deploying the Task Manager application on AWS, following the project requirements:
- React frontend on Elastic Beanstalk
- Node.js backend on EC2 using Docker
- PostgreSQL database on Amazon RDS
- File/Image storage on Amazon S3

## 1. Set Up VPC and Network Infrastructure

### Create a VPC
1. Go to the VPC Dashboard and click "Create VPC"
2. Name it `TaskManagerVPC`
3. Set IPv4 CIDR block to `10.0.0.0/16`
4. Click "Create"

### Create Subnets
1. Create public subnets for frontend and internet-facing components:
   - Public subnet 1: `10.0.1.0/24` in `us-east-1a`
   - Public subnet 2: `10.0.2.0/24` in `us-east-1b`
2. Create private subnets for database and backend:
   - Private subnet 1: `10.0.3.0/24` in `us-east-1a`
   - Private subnet 2: `10.0.4.0/24` in `us-east-1b`

### Create Internet Gateway
1. Create an Internet Gateway named `TaskManagerIGW`
2. Attach it to your VPC

### Create Route Tables
1. Create a public route table:
   - Add route `0.0.0.0/0` pointing to the Internet Gateway
   - Associate with public subnets
2. Create a private route table:
   - Associate with private subnets

## 2. Create Security Groups

### For Backend EC2
1. Create security group `TaskManager-BackendSG`:
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere
   - Allow SSH (port 22) from your IP
   - Allow port 5000 for API access

### For RDS Database
1. Create security group `TaskManager-DBSG`:
   - Allow PostgreSQL (port 5432) only from Backend Security Group

### For Frontend EB
1. Create security group `TaskManager-FrontendSG`:
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere

## 3. Set Up S3 Bucket for File Storage

1. Create a bucket in S3 named `task-manager-uploads`
2. Enable CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```
3. Set up bucket policy for public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadForTaskManagerUploads",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::task-manager-uploads/public/*"
       }
     ]
   }
   ```

## 4. Set Up IAM Roles

### For EC2
1. Create an IAM role named `TaskManager-EC2-Role`
2. Attach the following AWS managed policies:
   - `AmazonS3FullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`

### Create Custom S3 Policy
1. Create a custom policy named `TaskManager-S3-Policy`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::task-manager-uploads/*",
           "arn:aws:s3:::task-manager-uploads"
         ]
       }
     ]
   }
   ```
2. Attach this policy to the EC2 role

## 5. Create RDS PostgreSQL Database

1. Go to the RDS dashboard and click "Create database"
2. Choose PostgreSQL
3. Settings:
   - DB instance identifier: `taskmanager-db`
   - Master username: `postgres` (or your choice)
   - Master password: (create a strong password)
   - DB instance class: `db.t2.micro` (free tier)
   - Storage: 20GB General Purpose SSD
4. Network & Security:
   - VPC: `TaskManagerVPC`
   - Subnet group: Create new in private subnets
   - Public access: No
   - VPC security group: Use `TaskManager-DBSG`
5. Database options:
   - Initial database name: `taskmanager`
6. Click "Create database" and wait for it to be available
7. Note the database endpoint for configuration

## 6. Deploy Backend on EC2 with Docker

1. Launch an EC2 instance:
   - AMI: Amazon Linux 2
   - Instance type: t2.micro (free tier)
   - VPC: TaskManagerVPC
   - Subnet: One of your public subnets
   - Auto-assign public IP: Enable
   - IAM role: TaskManager-EC2-Role
   - Security group: TaskManager-BackendSG
   - Key pair: Create or select existing
   - Launch the instance

2. SSH into the EC2 instance:
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. Install Docker and Git:
   ```bash
   sudo yum update -y
   sudo amazon-linux-extras install docker -y
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   sudo systemctl enable docker
   sudo yum install git -y
   ```

4. Clone your repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/backend
   ```

5. Create an `.env` file with production settings:
   ```bash
   cat > .env << EOL
   DB_USER=postgres
   DB_HOST=your-rds-endpoint.rds.amazonaws.com
   DB_NAME=taskmanager
   DB_PASSWORD=your-rds-password
   DB_PORT=5432
   JWT_SECRET=your-secure-jwt-secret-key
   PORT=5000
   AWS_REGION=us-east-1
   S3_BUCKET=task-manager-uploads
   NODE_ENV=production
   EOL
   ```

6. Build and run Docker container:
   ```bash
   docker build -t task-manager-backend .
   docker run -d -p 80:5000 --env-file .env --name task-manager-app task-manager-backend
   ```

7. Verify your API is working:
   ```bash
   curl http://localhost/health
   ```

## 7. Deploy Frontend on Elastic Beanstalk

1. Install the EB CLI on your local machine

2. Update your frontend config file with the EC2 backend URL:
   - Edit: `src/config.js`
   - Update the `production.apiUrl` with your EC2 public URL

3. Build your React application for production:
   ```bash
   npm run build
   ```

4. Initialize Elastic Beanstalk:
   ```bash
   cd frontend
   eb init
   ```
   - Region: Select your region
   - Application name: TaskManagerFrontend
   - Platform: Node.js

5. Create an Elastic Beanstalk environment:
   ```bash
   eb create task-manager-frontend
   ```

6. Deploy your application:
   ```bash
   eb deploy
   ```

7. Once deployed, retrieve the EB URL:
   ```bash
   eb status
   ```

## 8. Security Best Practices

1. Use HTTPS for all communication
   - Set up SSL/TLS certificates using AWS Certificate Manager
   - Configure HTTPS on the load balancer or CloudFront

2. Apply the principle of least privilege
   - Review and restrict IAM policies
   - Limit security group access

3. Enable monitoring and logging
   - Set up CloudWatch alarms
   - Configure CloudTrail for API monitoring

## 9. Documentation Requirements

Ensure you have the following documentation:

1. Screenshots of:
   - IAM role creation and policies
   - Security Groups configuration
   - RDS database configuration
   - S3 bucket policy
   - EC2 instance running
   - Elastic Beanstalk environment

2. Create an architecture diagram showing:
   - VPC structure
   - Public/private subnets
   - EC2 instance
   - RDS database
   - S3 bucket
   - Elastic Beanstalk
   - Security groups and routing

3. Live URL endpoints for both frontend and backend

## Testing the Deployment

1. Access your frontend via the Elastic Beanstalk URL
2. Register a new user
3. Test CRUD operations for tasks
4. Test file upload functionality
5. Verify that data persists in the database

## Troubleshooting

- **Backend Connection Issues**: Check security groups and network ACLs
- **Database Connection Failures**: Verify credentials and security group settings
- **S3 Upload Errors**: Check IAM permissions and bucket policies
- **Frontend API Calls Failing**: Ensure CORS is configured correctly

## Clean-up (When Done with Project)

To avoid ongoing charges, remember to clean up resources when no longer needed:
1. Terminate EC2 instances
2. Delete Elastic Beanstalk environment
3. Delete RDS database
4. Empty and delete S3 buckets
5. Delete other resources (VPC, security groups, etc.)
