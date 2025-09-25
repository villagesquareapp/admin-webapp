# Next.js Admin App: Dockerization and CI/CD Pipeline

## Overview

This project containerizes a Next.js admin application using Docker and sets up a CI/CD pipeline for automated builds and deployments. This guide provides instructions on how to build, run, and deploy the application.

## Prerequisites

Before you begin, make sure you have the following:

*   **Docker:** Installed on your local machine.
*   **Node.js and npm:** Installed on your local machine (for local development).
*   **Git:** Installed on your local machine.
*   **GitHub Account:**  A GitHub account for storing the repository and setting up the CI/CD pipeline.
*   **AWS Account (if deploying to AWS):** An AWS account with appropriate permissions for ECR and EKS (or your target deployment environment).
*   **AWS CLI:** Configured with credentials to access your AWS account.

## 1. Dockerfile Setup

A multi-stage Dockerfile is located at the root of the repository (`Dockerfile`). It performs the following steps:

*   **Base Image:** Uses `node:20-alpine` as the base image for both the builder and runner stages.
*   **Dependencies:** Installs dependencies using `npm ci` to ensure consistent dependency versions.
*   **Build:** Builds the Next.js application using `npm run build`.
*   **Production Image:** Creates a production-ready image with only the necessary files to run the application.

## 2. .dockerignore

A `.dockerignore` file is included to exclude unnecessary files and directories from the Docker image, reducing its size and improving build performance. It typically includes:node_modules
.next
out
.env

## 3. Building and Running the Container Locally

### Building the Image

To build the Docker image locally, run the following command in the root of the repository:

```bash
docker build -t your-image-name .
Replace your-image-name with a name for your Docker image. For example: docker build -t nextjs-admin-app .
Running the Container
To run the Docker container locally, use the following command:docker run -p 3000:3000 your-image-name
This will start the Next.js application inside the container, and you can access it in your browser at http://localhost:3000.
4. CI/CD Pipeline Configuration
A CI/CD pipeline configuration file (.github/workflows/deploy.yml) is included to automate the build, test, and deployment process. This example uses GitHub Actions, but you can adapt it to your CI/CD system.
Pipeline Steps
The pipeline performs the following steps:

Checkout Code: Checks out the repository.
Set up Node.js: Sets up Node.js version 20.
Install Dependencies: Installs dependencies using npm ci.
Build: Builds the Next.js application using npm run build.
Test: Runs tests using npm test (if a test script is defined in package.json).
Configure AWS Credentials: Configures AWS credentials using OIDC (if deploying to AWS).
Log in to Amazon ECR: Logs in to Amazon ECR (if deploying to AWS).
Build Docker Image: Builds the Docker image.
Tag Docker Image: Tags the Docker image for ECR (if deploying to AWS).
Push Docker Image to ECR: Pushes the Docker image to ECR (if deploying to AWS).
Update Kubernetes Deployment: Updates the Kubernetes deployment manifest with the new image tag (if deploying to Kubernetes).
Apply Kubernetes Deployment: Applies the Kubernetes deployment to the cluster (if deploying to Kubernetes).
Triggering the Pipeline
The pipeline is triggered automatically on every push to the main branch and on pull requests targeting the main branch.
5. Important Notes
Environment Variables: Make sure to configure any necessary environment variables for your application in your deployment environment.
Secrets: Store sensitive information (e.g., API keys, database passwords) as secrets in your CI/CD system and reference them in your pipeline configuration.
Customization: You may need to customize the Dockerfile and CI/CD pipeline configuration to fit the specific needs of your application and deployment environment.
Deployment Environment: This README.md assumes you are deploying to AWS ECR and EKS. You will need to adapt the steps for your specific deployment environment.
