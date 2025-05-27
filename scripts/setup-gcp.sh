#!/bin/bash
# Setup script for Google Cloud resources needed for CI/CD

# Exit on error
set -e

# Configuration
PROJECT_ID="pocketbase-454721"
REGION="australia-southeast1"
SERVICE_NAME="expense-tracker"
REPO_NAME="expense-tracker"
SA_NAME="github-actions-sa"
GITHUB_REPO="chandra447/expense-tracker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Google Cloud resources for CI/CD...${NC}"

# Check if user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null; then
  echo -e "${RED}Not logged in to gcloud. Please run 'gcloud auth login' first.${NC}"
  exit 1
fi

# Set the project
echo -e "${YELLOW}Setting project to $PROJECT_ID...${NC}"
gcloud config set project $PROJECT_ID

# Get project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Create Artifact Registry repository if it doesn't exist
echo -e "${YELLOW}Creating Artifact Registry repository...${NC}"
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION 2>/dev/null; then
  gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="$SERVICE_NAME Docker repository"
  echo -e "${GREEN}Created Artifact Registry repository.${NC}"
else
  echo -e "${GREEN}Artifact Registry repository already exists.${NC}"
fi

# Create service account if it doesn't exist
echo -e "${YELLOW}Creating service account...${NC}"
if ! gcloud iam service-accounts describe $SA_NAME@$PROJECT_ID.iam.gserviceaccount.com 2>/dev/null; then
  gcloud iam service-accounts create $SA_NAME \
    --display-name="GitHub Actions Service Account"
  echo -e "${GREEN}Created service account.${NC}"
else
  echo -e "${GREEN}Service account already exists.${NC}"
fi

# Assign necessary roles to the service account
echo -e "${YELLOW}Assigning roles to service account...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

echo -e "${GREEN}Assigned roles to service account.${NC}"

# Setup Workload Identity Federation for GitHub Actions
echo -e "${YELLOW}Setting up Workload Identity Federation...${NC}"

# Create the Workload Identity Pool if it doesn't exist
echo -e "${YELLOW}Creating Workload Identity Pool...${NC}"
if ! gcloud iam workload-identity-pools describe "github-actions-pool" --location=global 2>/dev/null; then
  gcloud iam workload-identity-pools create "github-actions-pool" \
    --project="$PROJECT_ID" \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --description="Identity pool for GitHub Actions"
  echo -e "${GREEN}Created Workload Identity Pool.${NC}"
else
  echo -e "${GREEN}Workload Identity Pool already exists.${NC}"
fi

# Create the Workload Identity Provider in that pool
echo -e "${YELLOW}Creating Workload Identity Provider...${NC}"
if ! gcloud iam workload-identity-pools providers describe "github-actions-provider" --workload-identity-pool="github-actions-pool" --location=global 2>/dev/null; then
  gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
    --project="$PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="github-actions-pool" \
    --display-name="GitHub Actions Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-condition="attribute.repository=='${GITHUB_REPO}'"
  echo -e "${GREEN}Created Workload Identity Provider.${NC}"
else
  echo -e "${GREEN}Workload Identity Provider already exists.${NC}"
fi

# Allow the service account to be impersonated by the GitHub repository
echo -e "${YELLOW}Setting up service account impersonation...${NC}"
gcloud iam service-accounts add-iam-policy-binding \
  $SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${GITHUB_REPO}"

# Get the Workload Identity Provider resource name
PROVIDER_NAME="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}Add the following secrets to your GitHub repository:${NC}"
echo -e "${GREEN}WORKLOAD_IDENTITY_PROVIDER:${NC} ${PROVIDER_NAME}"
echo -e "${GREEN}SERVICE_ACCOUNT:${NC} ${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" 