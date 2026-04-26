# 🚀 Deploy ATS Resume Analyser to Google Cloud Run

## Prerequisites

| Requirement | Link |
|---|---|
| Google Cloud account | https://console.cloud.google.com |
| `gcloud` CLI installed | https://cloud.google.com/sdk/docs/install |
| Docker Desktop installed | https://docs.docker.com/get-docker/ |

---

## Step 1 — Authenticate & set your project

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

> Replace `YOUR_PROJECT_ID` with your actual GCP project ID (visible in the Cloud Console).

---

## Step 2 — Enable required APIs

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

---

## Step 3 — Create an Artifact Registry repository

```bash
gcloud artifacts repositories create ats-analyser \
  --repository-format=docker \
  --location=us-central1 \
  --description="ATS Resume Analyser images"
```

---

## Step 4 — Configure Docker to push to GCP

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

## Step 5 — Build & push the Docker image

```bash
# From the project directory (ATS Score Evaluator)
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ats-analyser/app:latest .

docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ats-analyser/app:latest
```

---

## Step 6 — Deploy to Cloud Run

```bash
gcloud run deploy ats-resume-analyser \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ats-analyser/app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

After deployment, the CLI will print your **public HTTPS URL** — e.g.
`https://ats-resume-analyser-xxxxxxxx-uc.a.run.app`

---

## One-liner: Build + Push + Deploy (copy & paste)

```bash
PROJECT_ID=YOUR_PROJECT_ID
REGION=us-central1
IMAGE=us-central1-docker.pkg.dev/$PROJECT_ID/ats-analyser/app:latest

docker build -t $IMAGE . && \
docker push $IMAGE && \
gcloud run deploy ats-resume-analyser \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi
```

---

## Updating the app

Whenever you change `index.html`, `style.css`, or `app.js`:

```bash
docker build -t $IMAGE . && docker push $IMAGE
gcloud run deploy ats-resume-analyser --image $IMAGE --region us-central1 --platform managed
```

---

## Cost estimate

| Resource | Free tier | Typical cost |
|---|---|---|
| Cloud Run requests | 2M req/month free | ~$0 for low traffic |
| Artifact Registry | 0.5 GB free | ~$0 for this image (<10 MB) |
| Egress | 1 GB/month free | ~$0 for low traffic |

> This app has **no backend** — it runs entirely in the browser, so Cloud Run only serves static files. Costs are near zero.

---

## File structure

```
ATS Score Evaluator/
├── index.html       ← App UI
├── style.css        ← Styles
├── app.js           ← Scoring engine
├── nginx.conf       ← Nginx server config
├── Dockerfile       ← Container definition
├── .dockerignore    ← Build exclusions
└── DEPLOY.md        ← This file
```
