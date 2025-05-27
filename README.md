# Expense Tracker

A modern expense tracking application built with Bun.

## Local Development

To install dependencies:

```bash
bun install
```

To build the frontend:

```bash
cd frontend && bun run build
```

To run the application:

```bash
bun run start
```

## CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment to Google Cloud Run. To set up the CI/CD pipeline:

1. Create a Google Cloud Service Account with the following roles:
   - Cloud Run Admin
   - Storage Admin
   - Artifact Registry Writer
   - Service Account User

2. Configure Workload Identity Federation in Google Cloud:
   - Go to IAM & Admin > Workload Identity Federation
   - Create a new provider for GitHub Actions
   - Configure it with your GitHub repository

3. Add the following secrets to your GitHub repository:
   - `WORKLOAD_IDENTITY_PROVIDER`: Your Workload Identity Provider
     - Format: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`
   - `SERVICE_ACCOUNT`: Your Google Cloud Service Account email
     - Format: `service-account-name@project-id.iam.gserviceaccount.com`

4. Create the Artifact Registry repository in Google Cloud:
   ```bash
   gcloud artifacts repositories create expense-tracker \
     --repository-format=docker \
     --location=australia-southeast1 \
     --description="Expense Tracker Docker repository"
   ```

5. Push to the main branch to trigger the deployment pipeline.

## Build and Deployment Process

The application's build process is streamlined:

1. **Local Development**: Build the frontend with `cd frontend && bun run build` for local testing
2. **CI/CD Pipeline**: 
   - The GitHub Actions workflow builds and pushes the Docker image
   - The Dockerfile handles building the frontend during the Docker build process
   - No redundant build steps occur in the GitHub Actions workflow itself

3. **Server**: The Hono server uses `serveStatic` to serve the frontend assets from the dist directory.

## Architecture

This application is containerized with Docker and deployed to Google Cloud Run. The CI/CD pipeline builds a platform-specific image (linux/amd64) to ensure compatibility with Cloud Run infrastructure.

This project was created using `bun init` in bun v1.2.14. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
