FROM postgres:latest

# Set environment variables
ENV POSTGRES_USER matcha_app
ENV POSTGRES_DB db
ENV POSTGRES_PASSWORD test

# Copy the initialization script into the container
COPY create_database.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432