dmin Webapp - Docker & CI/CD

This project uses Docker and GitHub Actions to build and deploy the Next.js admin app.

1. Prepare the project

Make sure package-lock.json exists (required for npm ci):

npm install


Commit the file if it’s new:

git add package-lock.json
git commit -m "Add package-lock.json for Docker & CI/CD"
git push

2. Build & run locally (production)

Build the Docker image:

docker build -t admin-webapp:local .


Run the container:

docker run -p 3000:3000 admin-webapp:local


Open your browser at http://localhost:3000

3. GitHub Actions CI/CD pipeline

Workflow file: .github/workflows/deploy.yml

Triggers:

Automatic: push to main or admin-webapp branch

Manual: Workflow dispatch

Pipeline steps:

Checkout the repository

Install dependencies with npm ci

Run tests (if any)

Build the Next.js app

Build Docker image

Push Docker image to GitHub Container Registry (ghcr.io)