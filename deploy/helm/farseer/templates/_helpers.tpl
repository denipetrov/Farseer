{{- define "farseer.image" -}}
{{- required "image.tag is required: deploy with --set image.tag=<version>" .Values.image.tag | printf "%s:%s" .Values.image.repository -}}
{{- end -}}

{{- define "farseer.labels" -}}
app.kubernetes.io/name: farseer
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Values.image.tag | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}

{{- define "farseer.selectorLabels" -}}
app.kubernetes.io/name: farseer
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/* The browser-side runtime config, served at /config.js. */}}
{{- define "farseer.configJs" -}}
window.__FARSEER_CONFIG__ = {{ .Values.runtimeConfig | toJson }};
{{- end -}}
