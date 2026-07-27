FROM alpine:latest

# Install security certificates and unzip utilities
RUN apk add --no-cache ca-certificates unzip wget

# Download the PocketBase binary (adjust architecture if using a Raspberry Pi/ARM server)
# This example downloads the standard AMD64 Linux build
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.39.4/pocketbase_0.39.4_linux_amd64.zip \
    && unzip pocketbase_0.39.4_linux_amd64.zip -d /pb \
    && rm pocketbase_0.39.4_linux_amd64.zip

COPY pb_migrations /pb/pb_migrations
COPY pb_hooks /pb/pb_hooks

EXPOSE 8080

# Start PocketBase and bind it to all network interfaces inside the container
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations"]
