# Use an official Node runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Install react-scripts globally
RUN npm install -g react-scripts@5.0.1

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

COPY start_front.sh /

# Give execute permission to the script
RUN chmod +x /start_front.sh

# Start the application
CMD ["/start_front.sh"]
