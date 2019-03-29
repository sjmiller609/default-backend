#
# Default backend for the Astronomer Platform
#

FROM alpine:3.8
MAINTAINER Astronomer <humans@astronomer.io>

ARG BUILD_NUMBER=-1
LABEL io.astronomer.docker.build.number=$BUILD_NUMBER
LABEL io.astronomer.docker.module="astronomer"
LABEL io.astronomer.docker.component="default-backend"
LABEL io.astronomer.docker.environment="development"

# Set and switch to installation directory.
WORKDIR /backend

# Add packages.json first so we can prevent rebuilds for code changes.
COPY package.json package.json

# Install packages / dependencies.
RUN apk update \
	&& apk add --no-cache --virtual .build-deps \
		build-base \
		git \
		python \
	&& apk add --no-cache \
		bash \
		netcat-openbsd \
		nodejs \
		nodejs-npm \
		openssl \
	&& npm install \
	&& apk del .build-deps

# Copy in source code.
COPY . .

# Expose port and run default start command.
EXPOSE 8080

ENV DEBUG=express:*

# Run the application
CMD ["npm", "run", "start"]
