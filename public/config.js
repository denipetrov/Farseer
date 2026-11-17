// Runtime configuration. In the cluster this file is replaced by a ConfigMap
// (deploy/helm/farseer/templates/configmap.yaml), so one image serves every environment.
// Locally, leave values empty to fall back to VITE_* variables from .env.local.
window.__FARSEER_CONFIG__ = {
  soulseekerApiUrl: '',
};
