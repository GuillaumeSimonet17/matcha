# First stage: Builder image for dependencies
FROM node:20-alpine3.17

# Declaring env
ENV NODE_ENV development

# Create working directory
WORKDIR /express-docker

# Install dependencies
# RUN npm install express socket.io

# Expose server port
EXPOSE 8080

# Copy start script
COPY start_express.sh /

# Give execute permission to the script
RUN chmod +x /start_express.sh

# Start the application
CMD ["/start_express.sh"]
