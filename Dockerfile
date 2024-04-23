# Use the official Node.js 18 image as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock (or package-lock.json if using npm)
COPY .prettierrc .eslintrc.js package.json yarn.lock .env ./

# DEV only purposes, not needed for production
RUN yarn global add @nestjs/cli

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Command to run the application
# DEV only purposes
CMD [ "yarn", "start:dev" ] 

# CMD [ "yarn", "start:prod" ] should be used for production deployment  