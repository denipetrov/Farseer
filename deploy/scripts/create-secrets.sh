#!/usr/bin/env bash
#
# Creates the `farseer` namespace and the image pull secret. Idempotent: safe
# to run on every deploy. Farseer holds no application secrets: it is static
# files, and the browser gets its own tokens from Soulseeker.
#
# Environment:
#   GHCR_USERNAME, GHCR_TOKEN (read:packages)   required
#   NAMESPACE                                   default: farseer

set -euo pipefail

NAMESPACE="${NAMESPACE:-farseer}"

: "${GHCR_USERNAME:?GHCR_USERNAME is required}"
: "${GHCR_TOKEN:?GHCR_TOKEN is required}"

command -v kubectl >/dev/null || { echo "error: kubectl is not installed" >&2; exit 1; }

echo "cluster:   $(kubectl config current-context)"
echo "namespace: ${NAMESPACE}"

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Rendered client-side and applied, so a re-run updates the token in place.
kubectl create secret docker-registry ghcr \
  --namespace "$NAMESPACE" \
  --docker-server=ghcr.io \
  --docker-username="$GHCR_USERNAME" \
  --docker-password="$GHCR_TOKEN" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets ready in ${NAMESPACE}."
