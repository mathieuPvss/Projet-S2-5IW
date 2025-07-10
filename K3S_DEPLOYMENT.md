# 🚀 Déploiement K3s - Query Forge Platform

## 📋 Architecture complète

Cette documentation détaille le déploiement de la plateforme Query Forge sur un cluster K3s avec monitoring complet via Prometheus et Grafana.

### Services déployés :

- **Frontend** : Nuxt.js (3 replicas)
- **Backend Services** : NestJS, Auth Service, Agent IA Service (2 replicas chacun)
- **Data Services** : Scraping Service, Sync Service (2 replicas chacun)
- **Databases** : PostgreSQL, Elasticsearch (1 replica chacune)
- **Monitoring** : Prometheus, Grafana, Kibana
- **Tools** : Adminer (debug)

---

## 📦 Prérequis

1. **Cluster K3s** : 1 master + 2 workers minimum
2. **kubectl** configuré pour accéder au cluster
3. **Docker** pour la construction des images
4. **Registry Docker** (DockerHub, Harbor, etc.)
5. **Traefik** : Intégré par défaut dans K3s (pas d'installation supplémentaire)

### 🌐 Pourquoi Traefik avec K3s ?

**Avantages Traefik + K3s :**

- ✅ **Intégré nativement** : Traefik est l'ingress controller par défaut de K3s
- ✅ **Métriques Prometheus** : Support natif sans configuration complexe
- ✅ **Dashboard intégré** : Interface web pour monitoring en temps réel
- ✅ **SSL automatique** : Génération et renouvellement automatique des certificats
- ✅ **Load balancing** : Intelligent avec health checks intégrés
- ✅ **Configuration dynamique** : Pas de redémarrage nécessaire
- ✅ **Middlewares** : Authentification, headers de sécurité, etc.

**vs Nginx Ingress :**

- 🚫 Nginx nécessite une installation séparée
- 🚫 Configuration plus complexe pour Prometheus
- 🚫 Pas de dashboard natif
- 🚫 SSL manuel

---

## 🗂️ Structure des manifests

```
k3s-manifests/
├── namespaces/
│   └── app-namespace.yaml
├── secrets/
│   ├── database-secret.yaml
│   └── api-keys-secret.yaml
├── configmaps/
│   └── app-config.yaml
├── persistent-volumes/
│   ├── postgres-pv.yaml
│   ├── elasticsearch-pv.yaml
│   ├── prometheus-pv.yaml
│   └── grafana-pv.yaml
├── databases/
│   ├── postgres.yaml
│   └── elasticsearch.yaml
├── backend/
│   ├── nestjs.yaml
│   ├── auth-service.yaml
│   ├── agent-ia-service.yaml
│   ├── scraping-service.yaml
│   └── sync-service.yaml
├── frontend/
│   └── frontend.yaml
├── monitoring/
│   ├── prometheus.yaml
│   ├── grafana.yaml
│   ├── grafana-traefik-dashboard.yaml
│   └── kibana.yaml
├── tools/
│   └── adminer.yaml
├── traefik/                    # ← NOUVEAU
│   ├── traefik-config.yaml
│   └── middlewares.yaml
├── ingress/
│   ├── app-ingress.yaml        # ← Modifié pour Traefik
│   └── monitoring-ingress.yaml # ← Séparé
└── scripts/
    ├── build-images.sh
    ├── configure-traefik.sh     # ← NOUVEAU
    ├── deploy.sh
    └── test-ha.sh
```

---

## 🐳 Phase 1 : Création des Dockerfiles

### Frontend (Nuxt.js)

```dockerfile
# frontend/Dockerfile
FROM node:23-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:23-alpine
WORKDIR /app
COPY --from=builder /app/.output .
EXPOSE 3000
CMD ["node", "server/index.mjs"]
```

### Backend Services

```dockerfile
# backend/query-forge-dev/Dockerfile
FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

```dockerfile
# backend/auth-service/Dockerfile
FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start"]
```

```dockerfile
# backend/agent-ia-service/Dockerfile
FROM node:23-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start"]
```

---

## 🔐 Phase 2 : Namespaces et Secrets

### Namespace

```yaml
# k3s-manifests/namespaces/app-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: query-forge
---
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
```

### Secrets

```yaml
# k3s-manifests/secrets/database-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
  namespace: query-forge
type: Opaque
stringData:
  POSTGRES_USER: "query_forge_user"
  POSTGRES_PASSWORD: "secure_password_123"
  POSTGRES_DB: "query_forge"
  JWT_SECRET: "your_super_secret_jwt_key_here"
```

```yaml
# k3s-manifests/secrets/api-keys-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-keys-secret
  namespace: query-forge
type: Opaque
stringData:
  YOUTUBE_API_KEY: "your_youtube_api_key"
  APIFY_API_TOKEN: "your_apify_token"
  OPENAI_API_KEY: "your_openai_key"
```

### ConfigMaps

```yaml
# k3s-manifests/configmaps/app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: query-forge
data:
  # Database
  POSTGRES_HOST: "postgres-service"
  POSTGRES_PORT: "5432"

  # Elasticsearch
  ELASTICSEARCH_HOSTS: "http://elasticsearch-service:9200"
  ES_PORT: "9200"
  EL_DISCOVERY_TYPE: "single-node"
  ES_JAVA_OPTS: "-Xms512m -Xmx512m"

  # Services URLs
  SCRAPER_SERVICE_URL: "http://scraping-service:8000"

  # Ports
  NEST_PORT: "3000"
  AUTH_PORT: "4000"
  AGENT_AI_PORT: "5000"
  SCRAPING_SERVICE_PORT: "8000"
  KIBANA_PORT: "5601"

  # JWT
  JWT_EXPIRES_IN: "1h"
  REFRESH_TOKEN_EXPIRES_IN: "7d"

  # Agent IA
  AGENT_AI_REQUIRE_AUTH: "true"

  # Stack version
  STACK_VERSION: "8.12.0"
```

---

## 💾 Phase 3 : Persistance des données

### PostgreSQL Volume

```yaml
# k3s-manifests/persistent-volumes/postgres-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /data/postgres

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: query-forge
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### Elasticsearch Volume

```yaml
# k3s-manifests/persistent-volumes/elasticsearch-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: elasticsearch-pv
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /data/elasticsearch

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: elasticsearch-pvc
  namespace: query-forge
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

### Prometheus Volume

```yaml
# k3s-manifests/persistent-volumes/prometheus-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: prometheus-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /data/prometheus

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: prometheus-pvc
  namespace: monitoring
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### Grafana Volume

```yaml
# k3s-manifests/persistent-volumes/grafana-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: grafana-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /data/grafana

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: grafana-pvc
  namespace: monitoring
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

---

## 🗄️ Phase 4 : Déploiement des bases de données

### PostgreSQL

```yaml
# k3s-manifests/databases/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: query-forge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9187"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: postgres
          image: postgres:17.4
          envFrom:
            - secretRef:
                name: database-secret
            - configMapRef:
                name: app-config
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
        - name: postgres-exporter
          image: prometheuscommunity/postgres-exporter:latest
          ports:
            - containerPort: 9187
          env:
            - name: DATA_SOURCE_NAME
              value: "postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:5432/$(POSTGRES_DB)?sslmode=disable"
          envFrom:
            - secretRef:
                name: database-secret
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: query-forge
  labels:
    app: postgres
spec:
  selector:
    app: postgres
  ports:
    - name: postgres
      port: 5432
      targetPort: 5432
    - name: metrics
      port: 9187
      targetPort: 9187
```

### Elasticsearch

```yaml
# k3s-manifests/databases/elasticsearch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elasticsearch
  namespace: query-forge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9108"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: elasticsearch
          image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
          env:
            - name: discovery.type
              value: "single-node"
            - name: xpack.security.enabled
              value: "false"
            - name: ES_JAVA_OPTS
              value: "-Xms512m -Xmx512m"
          ports:
            - containerPort: 9200
          volumeMounts:
            - name: elasticsearch-storage
              mountPath: /usr/share/elasticsearch/data
          resources:
            requests:
              memory: "1Gi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
        - name: elasticsearch-exporter
          image: prometheuscommunity/elasticsearch-exporter:latest
          ports:
            - containerPort: 9108
          args:
            - "--es.uri=http://localhost:9200"
            - "--es.all"
            - "--es.indices"
            - "--es.snapshots"
      volumes:
        - name: elasticsearch-storage
          persistentVolumeClaim:
            claimName: elasticsearch-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: elasticsearch-service
  namespace: query-forge
  labels:
    app: elasticsearch
spec:
  selector:
    app: elasticsearch
  ports:
    - name: elasticsearch
      port: 9200
      targetPort: 9200
    - name: metrics
      port: 9108
      targetPort: 9108
```

---

## ⚙️ Phase 5 : Services Backend (2 replicas minimum)

### Service Principal NestJS

```yaml
# k3s-manifests/backend/nestjs.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs
  namespace: query-forge
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nestjs
  template:
    metadata:
      labels:
        app: nestjs
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: nestjs
          image: votre-registry/query-forge-nestjs:latest
          envFrom:
            - secretRef:
                name: database-secret
            - configMapRef:
                name: app-config
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 5
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: nestjs-service
  namespace: query-forge
  labels:
    app: nestjs
spec:
  selector:
    app: nestjs
  ports:
    - port: 3000
      targetPort: 3000
```

### Auth Service

```yaml
# k3s-manifests/backend/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: query-forge
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "4000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: auth-service
          image: votre-registry/auth-service:latest
          envFrom:
            - secretRef:
                name: database-secret
            - configMapRef:
                name: app-config
          ports:
            - containerPort: 4000
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "250m"
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 5
          readinessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 5
            periodSeconds: 5
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: query-forge
  labels:
    app: auth-service
spec:
  selector:
    app: auth-service
  ports:
    - port: 4000
      targetPort: 4000
```

### Agent IA Service

```yaml
# k3s-manifests/backend/agent-ia-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-ia-service
  namespace: query-forge
spec:
  replicas: 2
  selector:
    matchLabels:
      app: agent-ia-service
  template:
    metadata:
      labels:
        app: agent-ia-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "5000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: agent-ia-service
          image: votre-registry/agent-ia-service:latest
          envFrom:
            - secretRef:
                name: database-secret
            - secretRef:
                name: api-keys-secret
            - configMapRef:
                name: app-config
          env:
            - name: AGENT_AI_PORT
              value: "5000"
            - name: AGENT_AI_REQUIRE_AUTH
              value: "true"
          ports:
            - containerPort: 5000
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 5
          readinessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 5
            timeoutSeconds: 5
            successThreshold: 1
            failureThreshold: 3
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: agent-ia-service
  namespace: query-forge
  labels:
    app: agent-ia-service
spec:
  selector:
    app: agent-ia-service
  ports:
    - port: 5000
      targetPort: 5000
```

### Scraping Service

```yaml
# k3s-manifests/backend/scraping-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scraping-service
  namespace: query-forge
spec:
  replicas: 2
  selector:
    matchLabels:
      app: scraping-service
  template:
    metadata:
      labels:
        app: scraping-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: scraping-service
          image: votre-registry/scraping-service:latest
          env:
            - name: SCRAPING_SERVICE_PORT
              value: "8000"
          ports:
            - containerPort: 8000
          securityContext:
            capabilities:
              add:
                - SYS_ADMIN
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 5
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            timeoutSeconds: 5
            successThreshold: 1
            failureThreshold: 3
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: scraping-service
  namespace: query-forge
  labels:
    app: scraping-service
spec:
  selector:
    app: scraping-service
  ports:
    - port: 8000
      targetPort: 8000
```

### Sync Service

```yaml
# k3s-manifests/backend/sync-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sync-service
  namespace: query-forge
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sync-service
  template:
    metadata:
      labels:
        app: sync-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: sync-service
          image: votre-registry/sync-service:latest
          envFrom:
            - secretRef:
                name: database-secret
            - configMapRef:
                name: app-config
            - secretRef:
                name: api-keys-secret
          env:
            - name: SCRAPER_SERVICE_URL
              value: "http://scraping-service:8000"
          ports:
            - containerPort: 3001
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: sync-service
  namespace: query-forge
  labels:
    app: sync-service
spec:
  selector:
    app: sync-service
    ports:
  - port: 3001
    targetPort: 3001
```

---

## 🌐 Phase 6 : Frontend (3 replicas minimum)

```yaml
# k3s-manifests/frontend/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: query-forge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: frontend
          image: votre-registry/query-forge-frontend:latest
          envFrom:
            - configMapRef:
                name: app-config
          env:
            - name: NUXT_PUBLIC_API_BASE_URL
              value: "http://app.local/api"
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "250m"
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 5
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            successThreshold: 1
            failureThreshold: 3
            timeoutSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: query-forge
  labels:
    app: frontend
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 3000
```

---

## 📊 Phase 7 : Monitoring avec Prometheus et Grafana

### Configuration Prometheus

```yaml
# k3s-manifests/monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    rule_files:
      # - "first_rules.yml"
      # - "second_rules.yml"

    scrape_configs:
      - job_name: 'prometheus'
        static_configs:
          - targets: ['localhost:9090']

      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
        - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
          action: keep
          regex: default;kubernetes;https

      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
        - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
        - action: labelmap
          regex: __meta_kubernetes_node_label_(.+)

      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
        - role: pod
        relabel_configs:
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          target_label: __address__
        - action: labelmap
          regex: __meta_kubernetes_pod_label_(.+)
        - source_labels: [__meta_kubernetes_namespace]
          action: replace
          target_label: kubernetes_namespace
        - source_labels: [__meta_kubernetes_pod_name]
          action: replace
          target_label: kubernetes_pod_name

      - job_name: 'query-forge-services'
        kubernetes_sd_configs:
        - role: service
          namespaces:
            names:
            - query-forge
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          target_label: __address__
        - action: labelmap
          regex: __meta_kubernetes_service_label_(.+)
        - source_labels: [__meta_kubernetes_namespace]
          action: replace
          target_label: kubernetes_namespace
        - source_labels: [__meta_kubernetes_service_name]
          action: replace
          target_label: kubernetes_name

      # Traefik metrics - Ingress Controller
      - job_name: 'traefik'
        static_configs:
          - targets: ['traefik.kube-system.svc.cluster.local:8082']
        metrics_path: /metrics
        scrape_interval: 30s
        scrape_timeout: 10s

      # Alternative Traefik avec découverte automatique
      - job_name: 'traefik-discovery'
        kubernetes_sd_configs:
        - role: service
          namespaces:
            names:
            - kube-system
        relabel_configs:
        - source_labels: [__meta_kubernetes_service_label_app_kubernetes_io_name]
          action: keep
          regex: traefik
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
          action: keep
          regex: true
        - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
          action: replace
          target_label: __metrics_path__
          regex: (.+)
        - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
          action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          target_label: __address__
        - action: labelmap
          regex: __meta_kubernetes_service_label_(.+)
        - source_labels: [__meta_kubernetes_namespace]
          action: replace
          target_label: kubernetes_namespace
        - source_labels: [__meta_kubernetes_service_name]
          action: replace
          target_label: kubernetes_name

      # Monitoring des certificats SSL
      - job_name: 'ssl-certificates'
        static_configs:
          - targets:
            - app.local:443
            - monitoring.local:443
        metrics_path: /probe
        params:
          module: [http_2xx]
        relabel_configs:
        - source_labels: [__address__]
          target_label: __param_target
        - source_labels: [__param_target]
          target_label: instance
        - target_label: __address__
          replacement: blackbox-exporter:9115
```

### Déploiement Prometheus

```yaml
# k3s-manifests/monitoring/prometheus.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
        - name: prometheus
          image: prom/prometheus:latest
          args:
            - "--config.file=/etc/prometheus/prometheus.yml"
            - "--storage.tsdb.path=/prometheus/"
            - "--web.console.libraries=/etc/prometheus/console_libraries"
            - "--web.console.templates=/etc/prometheus/consoles"
            - "--storage.tsdb.retention.time=200h"
            - "--web.enable-lifecycle"
          ports:
            - containerPort: 9090
          volumeMounts:
            - name: prometheus-config-volume
              mountPath: /etc/prometheus/
            - name: prometheus-storage-volume
              mountPath: /prometheus/
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
      volumes:
        - name: prometheus-config-volume
          configMap:
            defaultMode: 420
            name: prometheus-config
        - name: prometheus-storage-volume
          persistentVolumeClaim:
            claimName: prometheus-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: prometheus-service
  namespace: monitoring
  labels:
    app: prometheus
spec:
  selector:
    app: prometheus
  type: NodePort
  ports:
    - port: 9090
      targetPort: 9090
      nodePort: 30000

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: monitoring

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
  - apiGroups: [""]
    resources:
      - nodes
      - nodes/proxy
      - services
      - endpoints
      - pods
    verbs: ["get", "list", "watch"]
  - apiGroups:
      - extensions
    resources:
      - ingresses
    verbs: ["get", "list", "watch"]
  - nonResourceURLs: ["/metrics"]
    verbs: ["get"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
  - kind: ServiceAccount
    name: prometheus
    namespace: monitoring
```

### Déploiement Grafana

```yaml
# k3s-manifests/monitoring/grafana.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
        - name: grafana
          image: grafana/grafana:latest
          ports:
            - containerPort: 3000
          env:
            - name: GF_SECURITY_ADMIN_USER
              value: "admin"
            - name: GF_SECURITY_ADMIN_PASSWORD
              value: "admin123"
            - name: GF_INSTALL_PLUGINS
              value: "grafana-kubernetes-app"
          volumeMounts:
            - name: grafana-storage
              mountPath: /var/lib/grafana
            - name: grafana-datasources
              mountPath: /etc/grafana/provisioning/datasources
            - name: grafana-dashboards
              mountPath: /etc/grafana/provisioning/dashboards
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
      volumes:
        - name: grafana-storage
          persistentVolumeClaim:
            claimName: grafana-pvc
        - name: grafana-datasources
          configMap:
            name: grafana-datasources
        - name: grafana-dashboards
          configMap:
            name: grafana-dashboards

---
apiVersion: v1
kind: Service
metadata:
  name: grafana-service
  namespace: monitoring
  labels:
    app: grafana
spec:
  selector:
    app: grafana
  type: NodePort
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30001

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: monitoring
data:
  prometheus.yaml: |-
    {
        "apiVersion": 1,
        "datasources": [
            {
               "access":"proxy",
                "editable": true,
                "name": "prometheus",
                "orgId": 1,
                "type": "prometheus",
                "url": "http://prometheus-service:9090",
                "version": 1
            }
        ]
    }

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: monitoring
data:
  dashboard.yaml: |-
    {
        "apiVersion": 1,
        "providers": [
            {
                "folder": "",
                "name": "0",
                "options": {
                    "path": "/grafana-dashboard-definitions/0"
                },
                "orgId": 1,
                "type": "file"
            }
        ]
    }
```

### Kibana (pour logs Elasticsearch)

```yaml
# k3s-manifests/monitoring/kibana.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
  namespace: query-forge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
        - name: kibana
          image: docker.elastic.co/kibana/kibana:8.12.0
          env:
            - name: ELASTICSEARCH_HOSTS
              value: "http://elasticsearch-service:9200"
          ports:
            - containerPort: 5601
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: kibana-service
  namespace: query-forge
  labels:
    app: kibana
spec:
  selector:
    app: kibana
  ports:
    - port: 5601
      targetPort: 5601
```

---

## 🛠️ Phase 8 : Outils d'administration

### Adminer (pour debug PostgreSQL)

```yaml
# k3s-manifests/tools/adminer.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adminer
  namespace: query-forge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: adminer
  template:
    metadata:
      labels:
        app: adminer
    spec:
      containers:
        - name: adminer
          image: adminer:latest
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "100m"

---
apiVersion: v1
kind: Service
metadata:
  name: adminer-service
  namespace: query-forge
  labels:
    app: adminer
spec:
  selector:
    app: adminer
  ports:
    - port: 8080
      targetPort: 8080
```

---

## 🌍 Phase 9 : Configuration Traefik et Exposition (OBLIGATOIRE)

### Configuration Traefik pour K3s avec Prometheus

```yaml
# k3s-manifests/traefik/traefik-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: traefik-config
  namespace: kube-system
data:
  traefik.yaml: |
    # Configuration Traefik
    api:
      dashboard: true
      insecure: true

    metrics:
      prometheus:
        addEntryPointsLabels: true
        addServicesLabels: true
        addRoutersLabels: true
        buckets:
          - 0.1
          - 0.3
          - 1.2
          - 5.0

    entryPoints:
      web:
        address: ":80"
      websecure:
        address: ":443"
      traefik:
        address: ":8080"
      metrics:
        address: ":8082"

    providers:
      kubernetesIngress:
        ingressClass: traefik
      kubernetesCRD: {}

    # Configuration HTTPS avec certificats auto-signés
    certificatesResolvers:
      default:
        acme:
          email: admin@app.local
          storage: /data/acme.json
          httpChallenge:
            entryPoint: web

---
# Service pour exposer les métriques Traefik
apiVersion: v1
kind: Service
metadata:
  name: traefik-metrics
  namespace: kube-system
  labels:
    app.kubernetes.io/name: traefik
    app.kubernetes.io/instance: traefik
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8082"
    prometheus.io/path: "/metrics"
spec:
  selector:
    app.kubernetes.io/name: traefik
    app.kubernetes.io/instance: traefik
  ports:
    - name: metrics
      port: 8082
      targetPort: 8082
      protocol: TCP

---
# ServiceMonitor pour Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: traefik-metrics
  namespace: monitoring
  labels:
    app: traefik
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: traefik
  namespaceSelector:
    matchNames:
      - kube-system
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
```

### Ingress avec Traefik (Applications principales)

```yaml
# k3s-manifests/ingress/app-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: query-forge
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
    traefik.ingress.kubernetes.io/router.tls.certresolver: default
    traefik.ingress.kubernetes.io/router.middlewares: default-headers@kubernetescrd
spec:
  ingressClassName: traefik
  tls:
    - hosts:
        - app.local
      secretName: app-local-tls
  rules:
    - host: app.local
      http:
        paths:
          # Frontend - Priorité la plus basse (doit être en dernier)
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80

          # Backend APIs - Priorité haute
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: nestjs-service
                port:
                  number: 3000

          - path: /auth
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 4000

          - path: /agent
            pathType: Prefix
            backend:
              service:
                name: agent-ia-service
                port:
                  number: 5000

          - path: /scraping
            pathType: Prefix
            backend:
              service:
                name: scraping-service
                port:
                  number: 8000

          - path: /sync
            pathType: Prefix
            backend:
              service:
                name: sync-service
                port:
                  number: 3001

          # Outils de debug
          - path: /kibana
            pathType: Prefix
            backend:
              service:
                name: kibana-service
                port:
                  number: 5601

          - path: /adminer
            pathType: Prefix
            backend:
              service:
                name: adminer-service
                port:
                  number: 8080

---
# Ingress pour le monitoring
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: monitoring-ingress
  namespace: monitoring
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
    traefik.ingress.kubernetes.io/router.tls.certresolver: default
    traefik.ingress.kubernetes.io/router.middlewares: monitoring-auth@kubernetescrd
spec:
  ingressClassName: traefik
  tls:
    - hosts:
        - monitoring.local
      secretName: monitoring-local-tls
  rules:
    - host: monitoring.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: grafana-service
                port:
                  number: 3000

          - path: /prometheus
            pathType: Prefix
            backend:
              service:
                name: prometheus-service
                port:
                  number: 9090

          - path: /traefik
            pathType: Prefix
            backend:
              service:
                name: traefik-dashboard
                port:
                  number: 8080

---
# Service pour le dashboard Traefik
apiVersion: v1
kind: Service
metadata:
  name: traefik-dashboard
  namespace: monitoring
spec:
  type: ExternalName
  externalName: traefik.kube-system.svc.cluster.local
  ports:
    - port: 8080
      targetPort: 8080
```

### Middlewares Traefik pour sécurité

```yaml
# k3s-manifests/traefik/middlewares.yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: default-headers
  namespace: query-forge
spec:
  headers:
    frameDeny: true
    sslRedirect: true
    browserXssFilter: true
    contentTypeNosniff: true
    forceSTSHeader: true
    stsIncludeSubdomains: true
    stsPreload: true
    stsSeconds: 31536000
    customRequestHeaders:
      X-Forwarded-Proto: "https"

---
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: monitoring-auth
  namespace: monitoring
spec:
  basicAuth:
    secret: monitoring-auth-secret

---
# Secret pour l'authentification du monitoring
apiVersion: v1
kind: Secret
metadata:
  name: monitoring-auth-secret
  namespace: monitoring
type: Opaque
data:
  # admin:admin123 encodé en base64
  users: YWRtaW46JGFwcjEkSDZ1c2NmM3MkTE1wOVFOaW1pSXh0L3hhcXlKL0sv
```

### Activation des métriques Traefik dans K3s

```bash
# scripts/configure-traefik.sh
#!/bin/bash

echo "🚀 Configuration de Traefik pour K3s avec métriques Prometheus..."

# 1. Modifier la configuration Traefik de K3s
sudo mkdir -p /var/lib/rancher/k3s/server/manifests/traefik

# 2. Configuration personnalisée pour Traefik
cat <<EOF | sudo tee /var/lib/rancher/k3s/server/manifests/traefik/traefik-config.yaml
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    metrics:
      prometheus:
        enabled: true
        addEntryPointsLabels: true
        addServicesLabels: true
        addRoutersLabels: true

    service:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8082"
        prometheus.io/path: "/metrics"

    ports:
      traefik:
        port: 9000
        expose: true
        exposedPort: 9000
        protocol: TCP
      web:
        port: 8000
        expose: true
        exposedPort: 80
        protocol: TCP
      websecure:
        port: 8443
        expose: true
        exposedPort: 443
        protocol: TCP
        tls:
          enabled: true
      metrics:
        port: 8082
        expose: true
        exposedPort: 8082
        protocol: TCP

    additionalArguments:
      - "--metrics.prometheus=true"
      - "--metrics.prometheus.addEntryPointsLabels=true"
      - "--metrics.prometheus.addServicesLabels=true"
      - "--metrics.prometheus.addRoutersLabels=true"
      - "--entrypoints.metrics.address=:8082"
      - "--api.dashboard=true"
      - "--api.debug=true"

    ingressClass:
      enabled: true
      isDefaultClass: true
EOF

# 3. Redémarrer K3s pour appliquer la config
echo "🔄 Redémarrage de K3s..."
sudo systemctl restart k3s

echo "⏳ Attente du redémarrage de Traefik..."
sleep 30

# 4. Vérifier le déploiement
kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik

echo "✅ Configuration Traefik terminée!"
echo "🌐 Dashboard Traefik: http://monitoring.local/traefik"
echo "📊 Métriques: http://<node-ip>:8082/metrics"
```

---

### Dashboard Grafana pour Traefik

```yaml
# k3s-manifests/monitoring/grafana-traefik-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: traefik-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  traefik-dashboard.json: |
    {
      "dashboard": {
        "id": null,
        "title": "Traefik v2.x",
        "tags": ["traefik"],
        "style": "dark",
        "timezone": "browser",
        "panels": [
          {
            "title": "Global Request Volume",
            "type": "stat",
            "targets": [
              {
                "expr": "sum(rate(traefik_service_requests_total[5m]))",
                "legendFormat": "Requests/sec"
              }
            ],
            "fieldConfig": {
              "defaults": {
                "color": {"mode": "palette-classic"},
                "unit": "reqps"
              }
            }
          },
          {
            "title": "Global Response Time",
            "type": "stat", 
            "targets": [
              {
                "expr": "histogram_quantile(0.95, sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (le))",
                "legendFormat": "95th percentile"
              }
            ],
            "fieldConfig": {
              "defaults": {
                "color": {"mode": "palette-classic"},
                "unit": "s"
              }
            }
          },
          {
            "title": "HTTP Status Codes",
            "type": "timeseries",
            "targets": [
              {
                "expr": "sum by (code) (rate(traefik_service_requests_total[5m]))",
                "legendFormat": "{{code}}"
              }
            ]
          },
          {
            "title": "Top Services by Request Rate",
            "type": "timeseries",
            "targets": [
              {
                "expr": "topk(10, sum by (service) (rate(traefik_service_requests_total[5m])))",
                "legendFormat": "{{service}}"
              }
            ]
          },
          {
            "title": "Backend Response Time by Service",
            "type": "timeseries",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (service, le))",
                "legendFormat": "{{service}} - 95th"
              }
            ]
          }
        ],
        "time": {
          "from": "now-1h",
          "to": "now"
        },
        "refresh": "30s"
      }
    }
```

---

## 🚀 Phase 10 : Scripts d'automatisation

### Script de construction des images

```bash
#!/bin/bash
# scripts/build-images.sh

echo "🏗️ Construction des images Docker..."

# Variables
REGISTRY="votre-registry"  # Remplacez par votre registry
TAG=${1:-latest}

# Construire et pousser les images
echo "📦 Frontend..."
docker build -t $REGISTRY/query-forge-frontend:$TAG ./frontend
docker push $REGISTRY/query-forge-frontend:$TAG

echo "📦 NestJS..."
docker build -t $REGISTRY/query-forge-nestjs:$TAG ./backend/query-forge-dev
docker push $REGISTRY/query-forge-nestjs:$TAG

echo "📦 Auth Service..."
docker build -t $REGISTRY/auth-service:$TAG ./backend/auth-service
docker push $REGISTRY/auth-service:$TAG

echo "📦 Agent IA Service..."
docker build -t $REGISTRY/agent-ia-service:$TAG ./backend/agent-ia-service
docker push $REGISTRY/agent-ia-service:$TAG

echo "📦 Sync Service..."
docker build -t $REGISTRY/sync-service:$TAG ./backend/sync-service
docker push $REGISTRY/sync-service:$TAG

echo "📦 Scraping Service..."
docker build -t $REGISTRY/scraping-service:$TAG ./backend/scraping-service
docker push $REGISTRY/scraping-service:$TAG

echo "✅ Toutes les images sont construites et poussées!"
```

### Script de déploiement complet

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Déploiement complet sur K3s avec Traefik..."

# Créer les répertoires de données sur les nœuds
echo "📁 Création des répertoires de données..."
sudo mkdir -p /data/{postgres,elasticsearch,prometheus,grafana}
sudo chmod 777 /data/{postgres,elasticsearch,prometheus,grafana}

# Configuration Traefik OBLIGATOIRE AVANT TOUT
echo "🌐 Phase 0: Configuration de Traefik..."
chmod +x scripts/configure-traefik.sh
./scripts/configure-traefik.sh

echo "⏳ Attente de la stabilisation de Traefik..."
sleep 60

# Déploiement par étapes
echo "🏗️ Phase 1: Namespaces et configuration de base..."
kubectl apply -f k3s-manifests/namespaces/
kubectl apply -f k3s-manifests/secrets/
kubectl apply -f k3s-manifests/configmaps/

echo "💾 Phase 2: Volumes persistants..."
kubectl apply -f k3s-manifests/persistent-volumes/

echo "⏳ Attente de la création des volumes..."
sleep 10

echo "🗄️ Phase 3: Bases de données..."
kubectl apply -f k3s-manifests/databases/

echo "⏳ Attente du démarrage des bases de données..."
sleep 90

# Vérifier que les BD sont prêtes
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n query-forge
kubectl wait --for=condition=available --timeout=300s deployment/elasticsearch -n query-forge

echo "⚙️ Phase 4: Services backend..."
kubectl apply -f k3s-manifests/backend/

echo "🌐 Phase 5: Frontend..."
kubectl apply -f k3s-manifests/frontend/

echo "📊 Phase 6: Monitoring..."
kubectl apply -f k3s-manifests/monitoring/

echo "🛠️ Phase 7: Outils..."
kubectl apply -f k3s-manifests/tools/

echo "⏳ Attente du démarrage des services..."
sleep 60

echo "🔐 Phase 8: Middlewares Traefik..."
kubectl apply -f k3s-manifests/traefik/middlewares.yaml

echo "🌍 Phase 9: Ingress avec Traefik..."
kubectl apply -f k3s-manifests/ingress/

echo "✅ Déploiement terminé!"
echo ""
echo "📱 Applications accessibles via:"
echo "   - App principale: https://app.local (HTTP redirigé vers HTTPS)"
echo "   - Kibana: https://app.local/kibana"
echo "   - Adminer: https://app.local/adminer"
echo ""
echo "📊 Monitoring accessibles via:"
echo "   - Grafana: https://monitoring.local (admin/admin123)"
echo "   - Prometheus: https://monitoring.local/prometheus"
echo "   - Traefik Dashboard: https://monitoring.local/traefik"
echo "   - Auth: admin/admin123 (configuré dans middlewares)"
echo ""
echo "🔧 Métriques brutes:"
echo "   - Traefik: http://<node-ip>:8082/metrics"
echo "   - Node Exporter: http://<node-ip>:9100/metrics"
echo ""
echo "⚙️ Ajoutez ces lignes à /etc/hosts:"
echo "   <IP_DU_CLUSTER> app.local"
echo "   <IP_DU_CLUSTER> monitoring.local"
echo ""
echo "🛡️ Fonctionnalités Traefik activées:"
echo "   ✅ Redirection automatique HTTP → HTTPS"
echo "   ✅ Certificats SSL auto-signés"
echo "   ✅ Métriques Prometheus intégrées"
echo "   ✅ Dashboard Traefik avec authentification"
echo "   ✅ Headers de sécurité (HSTS, XSS Protection, etc.)"
echo "   ✅ Load balancing automatique"
```

### Script de test de haute disponibilité

```bash
#!/bin/bash
# scripts/test-ha.sh

echo "🧪 Tests de haute disponibilité..."

# Test 1: Scaling horizontal
echo "📈 Test 1: Scaling horizontal..."
kubectl scale deployment nestjs --replicas=4 -n query-forge
kubectl scale deployment auth-service --replicas=3 -n query-forge
kubectl scale deployment frontend --replicas=5 -n query-forge

echo "⏳ Attente du scaling..."
sleep 30

echo "✅ État après scaling:"
kubectl get pods -n query-forge -l app=nestjs
kubectl get pods -n query-forge -l app=auth-service
kubectl get pods -n query-forge -l app=frontend

# Test 2: Résistance aux pannes
echo ""
echo "💀 Test 2: Résistance aux pannes..."
POD_NESTJS=$(kubectl get pods -n query-forge -l app=nestjs -o jsonpath='{.items[0].metadata.name}')
POD_FRONTEND=$(kubectl get pods -n query-forge -l app=frontend -o jsonpath='{.items[0].metadata.name}')

echo "🔪 Suppression de pods: $POD_NESTJS, $POD_FRONTEND"
kubectl delete pod $POD_NESTJS -n query-forge
kubectl delete pod $POD_FRONTEND -n query-forge

echo "⏳ Attente de la recréation automatique..."
sleep 30

echo "✅ État après suppression:"
kubectl get pods -n query-forge

# Test 3: Métriques disponibles
echo ""
echo "📊 Test 3: Vérification des métriques..."
kubectl get servicemonitor -A
echo ""
echo "📈 Targets Prometheus:"
curl -s http://app.local/prometheus/api/v1/targets | jq '.data.activeTargets[] | {job: .discoveredLabels.job, health: .health}'

# Test 4: Load balancing
echo ""
echo "⚖️ Test 4: Load balancing..."
for i in {1..10}; do
    echo "Request $i:"
    curl -s -o /dev/null -w "%{http_code} - %{time_total}s\n" http://app.local/api/health
    sleep 1
done

echo ""
echo "✅ Tests de haute disponibilité terminés!"
```

### Script de nettoyage

```bash
#!/bin/bash
# scripts/cleanup.sh

echo "🧹 Nettoyage du cluster..."

# Supprimer les déploiements
kubectl delete -f k3s-manifests/ingress/ --ignore-not-found=true
kubectl delete -f k3s-manifests/traefik/middlewares.yaml --ignore-not-found=true
kubectl delete -f k3s-manifests/tools/ --ignore-not-found=true
kubectl delete -f k3s-manifests/monitoring/ --ignore-not-found=true
kubectl delete -f k3s-manifests/frontend/ --ignore-not-found=true
kubectl delete -f k3s-manifests/backend/ --ignore-not-found=true
kubectl delete -f k3s-manifests/databases/ --ignore-not-found=true
kubectl delete -f k3s-manifests/persistent-volumes/ --ignore-not-found=true
kubectl delete -f k3s-manifests/configmaps/ --ignore-not-found=true
kubectl delete -f k3s-manifests/secrets/ --ignore-not-found=true
kubectl delete -f k3s-manifests/namespaces/ --ignore-not-found=true

# Remettre Traefik en configuration par défaut
echo "🔄 Restauration de la configuration Traefik par défaut..."
sudo rm -f /var/lib/rancher/k3s/server/manifests/traefik/traefik-config.yaml
sudo systemctl restart k3s

# Supprimer les données persistantes (optionnel)
read -p "Supprimer les données persistantes ? (y/N): " confirm
if [[ $confirm == [yY] ]]; then
    sudo rm -rf /data/postgres/*
    sudo rm -rf /data/elasticsearch/*
    sudo rm -rf /data/prometheus/*
    sudo rm -rf /data/grafana/*
    echo "✅ Données supprimées"
fi

echo "✅ Nettoyage terminé!"
```

### Guide des métriques Traefik disponibles

```bash
# scripts/traefik-metrics-guide.sh
#!/bin/bash

echo "📊 Guide des métriques Traefik disponibles..."
echo ""

echo "🔍 Métriques principales :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📈 TRAFIC :"
echo "  • traefik_service_requests_total        - Nombre total de requêtes par service"
echo "  • traefik_service_request_duration      - Temps de réponse par service"
echo "  • traefik_entrypoint_requests_total     - Requêtes par entrypoint (web/websecure)"

echo ""
echo "🌐 BACKENDS :"
echo "  • traefik_service_server_up             - Statut des backends (1=up, 0=down)"
echo "  • traefik_backend_requests_total        - Requêtes par backend"

echo ""
echo "🔒 SSL/TLS :"
echo "  • traefik_tls_certs_not_after          - Date d'expiration des certificats"

echo ""
echo "⚡ PERFORMANCE :"
echo "  • traefik_config_reloads_total          - Nombre de rechargements de config"
echo "  • traefik_config_last_reload_success    - Succès du dernier rechargement"

echo ""
echo "🎯 Requêtes PromQL utiles :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📊 Taux de requêtes par seconde :"
echo "   sum(rate(traefik_service_requests_total[5m]))"

echo ""
echo "⏱️ Temps de réponse 95e percentile :"
echo "   histogram_quantile(0.95, sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (le))"

echo ""
echo "📈 Top 10 des services les plus sollicités :"
echo "   topk(10, sum by (service) (rate(traefik_service_requests_total[5m])))"

echo ""
echo "💥 Taux d'erreur par service :"
echo "   sum(rate(traefik_service_requests_total{code=~\"5..\"}[5m])) by (service) / sum(rate(traefik_service_requests_total[5m])) by (service)"

echo ""
echo "🔍 Backends indisponibles :"
echo "   traefik_service_server_up == 0"

echo ""
echo "📊 Dashboard Grafana prêt avec ces métriques !"
echo "   👆 Accessible via: https://monitoring.local"

echo ""
echo "🧪 Test des métriques en direct :"
curl -s http://localhost:8082/metrics | grep -E "(traefik_service_requests_total|traefik_service_request_duration)" | head -10
```

---

## 🛡️ Phase 11 : Sécurisation HTTPS (OBLIGATOIRE)

### Certificat auto-signé

```bash
#!/bin/bash
# scripts/generate-ssl.sh

echo "🔐 Génération des certificats SSL..."

# Créer le certificat auto-signé
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certs/tls.key \
    -out certs/tls.crt \
    -subj "/CN=app.local/O=query-forge"

# Créer le secret Kubernetes
kubectl create secret tls app-tls-secret \
    --cert=certs/tls.crt \
    --key=certs/tls.key \
    -n query-forge

kubectl create secret tls monitoring-tls-secret \
    --cert=certs/tls.crt \
    --key=certs/tls.key \
    -n monitoring

echo "✅ Certificats créés et déployés!"
```

### Ingress HTTPS mis à jour

```yaml
# k3s-manifests/ingress/ingress-https.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress-https
  namespace: query-forge
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
    - hosts:
        - app.local
      secretName: app-tls-secret
  rules:
    - host: app.local
      http:
        paths:
        # ... même configuration que l'ingress HTTP
```

---

## 🎯 Phase 12 : Fonctionnalités Bonus (+5 points)

### 1. Resource Requests & Limits (+1pt)

✅ **Déjà implémenté** dans tous les manifests avec requests et limits.

### 2. NetworkPolicy (+1pt)

```yaml
# k3s-manifests/security/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: query-forge
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: query-forge
spec:
  podSelector:
    matchLabels:
      app: nestjs
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 3000

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-backend-to-db
  namespace: query-forge
spec:
  podSelector:
    matchLabels:
      app: postgres
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: nestjs
        - podSelector:
            matchLabels:
              app: auth-service
      ports:
        - protocol: TCP
          port: 5432
```

### 3. Autoscaling HPA (+1pt)

```yaml
# k3s-manifests/autoscaling/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nestjs-hpa
  namespace: query-forge
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nestjs
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: query-forge
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 3
  maxReplicas: 15
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
```

### 4. Helm Charts (+1pt)

```yaml
# helm/query-forge/Chart.yaml
apiVersion: v2
name: query-forge
description: Query Forge Platform Helm Chart
type: application
version: 0.1.0
appVersion: "1.0.0"
```

```yaml
# helm/query-forge/values.yaml
global:
  registry: "votre-registry"
  tag: "latest"

database:
  postgres:
    user: "query_forge_user"
    password: "secure_password_123"
    database: "query_forge"

services:
  nestjs:
    replicas: 2
    image: "query-forge-nestjs"

  frontend:
    replicas: 3
    image: "query-forge-frontend"

monitoring:
  prometheus:
    enabled: true
    retention: "30d"

  grafana:
    enabled: true
    adminPassword: "admin123"

ingress:
  enabled: true
  host: "app.local"
  tls:
    enabled: false
```

### 5. CI/CD Pipeline (+1pt)

```yaml
# .github/workflows/deploy.yml
name: Deploy to K3s

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.REGISTRY_URL }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Build and push images
        run: |
          ./scripts/build-images.sh ${{ github.sha }}

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: "v1.28.0"

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBECONFIG }}" | base64 -d > ~/.kube/config

      - name: Deploy to K3s
        run: |
          # Mettre à jour les images dans les manifests
          find k3s-manifests -name "*.yaml" -exec sed -i "s/:latest/:${{ github.sha }}/g" {} \;

          # Déployer
          ./scripts/deploy.sh

      - name: Run health checks
        run: |
          ./scripts/test-ha.sh
```

---

## 📋 Phase 13 : Tests et validation

### Checklist de validation

#### ✅ Exigences minimales (15 points)

- [ ] **Cluster (2pts)** : 1 master + 2 workers avec K3s
- [ ] **Déploiement (5pts)** : Frontend (3 replicas), Backend services (2 replicas), BDD (1 replica)
- [ ] **Persistance (2pts)** : PersistentVolumes pour PostgreSQL et Elasticsearch
- [ ] **Sécurité (2pts)** : Secrets pour mots de passe, HTTPS avec certificats
- [ ] **Exposition (2pts)** : Ingress avec Load Balancer, DNS app.local
- [ ] **Documentation (2pts)** : Scripts et captures d'écran

#### 🎁 Fonctionnalités bonus (5 points max)

- [ ] **Resource Requests & Limits (+1pt)** : CPU/RAM définis sur tous les pods
- [ ] **NetworkPolicy (+1pt)** : Restrictions réseau entre services
- [ ] **Autoscaling HPA (+1pt)** : Scaling automatique basé sur CPU/RAM
- [ ] **Helm Charts (+1pt)** : Déploiement paramétrable
- [ ] **CI/CD (+1pt)** : Pipeline automatisé GitHub Actions

### Commandes de test essentielles

```bash
# Vérifier l'état du cluster
kubectl get nodes
kubectl get pods --all-namespaces

# Vérifier les services
kubectl get svc -n query-forge
kubectl get svc -n monitoring

# Tester la haute disponibilité
kubectl scale deployment nestjs --replicas=5 -n query-forge
kubectl get pods -n query-forge -w

# Tester la résistance aux pannes
kubectl delete pod <nom-pod> -n query-forge

# Vérifier les métriques
curl http://app.local/prometheus/api/v1/targets
curl http://app.local/grafana/api/health

# Vérifier les logs
kubectl logs -f deployment/nestjs -n query-forge
```

---

## 📚 Ordre d'exécution recommandé

1. **Préparation** :

   ```bash
   mkdir -p k3s-manifests/{namespaces,secrets,configmaps,persistent-volumes,databases,backend,frontend,monitoring,tools,ingress,scripts}
   chmod +x scripts/*.sh
   ```

2. **Construction des images** :

   ```bash
   ./scripts/build-images.sh
   ```

3. **Déploiement** :

   ```bash
   ./scripts/deploy.sh
   ```

4. **Configuration DNS** :

   ```bash
   echo "$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}') app.local monitoring.local" | sudo tee -a /etc/hosts
   ```

5. **Tests** :

   ```bash
   ./scripts/test-ha.sh
   ```

6. **Sécurisation HTTPS** :

   ```bash
   ./scripts/generate-ssl.sh
   kubectl apply -f k3s-manifests/ingress/ingress-https.yaml
   ```

7. **Fonctionnalités bonus** :
   ```bash
   kubectl apply -f k3s-manifests/security/network-policies.yaml
   kubectl apply -f k3s-manifests/autoscaling/hpa.yaml
   ```

---

## 🎯 Résultat final

Avec cette configuration complète, vous obtiendrez :

- **✅ 15/15 points** pour les exigences minimales
- **✅ +5 points bonus** pour les fonctionnalités avancées
- **🏆 Score total : 20/15**

Votre plateforme Query Forge sera déployée avec une **haute disponibilité**, un **monitoring complet**, et toutes les **meilleures pratiques** de Kubernetes ! 🚀
