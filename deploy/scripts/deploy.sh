#!/usr/bin/env bash
#
# Deploys Farseer to the `farseer` namespace: a rolling update, rolled back
# automatically if the new pods never become ready.
#
# Usage:
#   deploy/scripts/deploy.sh <image-tag>
#
# Environment:
#   NAMESPACE (farseer)
#   FARSEER_HELM_ARGS   extra arguments for the release, e.g. for a local cluster:
#     FARSEER_HELM_ARGS="--set image.repository=farseer --set imagePullSecrets=null \
#                        --set httpRoute.enabled=false" deploy/scripts/deploy.sh local

set -euo pipefail

IMAGE_TAG="${1:-}"
if [ -z "$IMAGE_TAG" ]; then
  echo "usage: $0 <image-tag>" >&2
  exit 1
fi

NAMESPACE="${NAMESPACE:-farseer}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for tool in kubectl helm; do
  command -v "$tool" >/dev/null || { echo "error: ${tool} is not installed" >&2; exit 1; }
done

# Helm 4 renamed --atomic to --rollback-on-failure.
case "$(helm version --short)" in
  v3.*) ROLLBACK_FLAG=--atomic ;;
  *) ROLLBACK_FLAG=--rollback-on-failure ;;
esac

echo "cluster:   $(kubectl config current-context)"
echo "namespace: ${NAMESPACE}"
echo "image tag: ${IMAGE_TAG}"
echo

if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
  echo "error: namespace ${NAMESPACE} does not exist; run deploy/scripts/create-secrets.sh first" >&2
  exit 1
fi

echo "==> Farseer"
# shellcheck disable=SC2086
helm upgrade --install farseer "$ROOT/helm/farseer" \
  --namespace "$NAMESPACE" \
  --set-string "image.tag=${IMAGE_TAG}" \
  --wait --timeout 5m "$ROLLBACK_FLAG" \
  ${FARSEER_HELM_ARGS:-}

echo
kubectl get pods --namespace "$NAMESPACE" -o wide
echo
echo "Deployed ${IMAGE_TAG}. To check it from inside the cluster:"
echo "  kubectl -n ${NAMESPACE} port-forward svc/farseer 8080:80"
echo "  curl http://localhost:8080/healthz"
