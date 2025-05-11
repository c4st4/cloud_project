FROM node:16-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all npm packages (including aws-sdk and bcryptjs if they are in package.json)
RUN npm install

# Copy the rest of the application code
COPY . .

# Make sure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server-aws.js"]
