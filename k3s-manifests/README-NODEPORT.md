# NodePort Configuration for Traefik

## Overview
This deployment uses Traefik with NodePort service type instead of LoadBalancer to avoid MetalLB configuration issues and simplify networking.

## Configuration Changes

### Traefik HelmChartConfig
- **Service Type**: Changed from `LoadBalancer` to `NodePort`
- **NodePorts**:
  - HTTP: 30080
  - HTTPS: 30443
  - Dashboard: 30900

### Benefits
1. **No MetalLB Dependency**: Eliminates MetalLB configuration issues
2. **Direct Access**: Access services directly via node IP + NodePort
3. **Simpler Networking**: No external load balancer complexity
4. **Better Debugging**: Easier to troubleshoot connectivity issues
5. **Cloudflare Integration**: Still works with Cloudflare DNS and SSL

## Access URLs

### Direct NodePort Access
- **HTTP**: `http://192.168.1.181:30080`
- **HTTPS**: `https://192.168.1.181:30443`
- **Traefik Dashboard**: `http://192.168.1.181:30900`

### Domain Access (if Cloudflare configured)
- **Frontend**: `https://query-forge-dev.ualtarh.com`
- **API**: `https://api.ualtarh.com`
- **Auth**: `https://auth.ualtarh.com`
- **Agent**: `https://agent.ualtarh.com`
- **Scraping**: `https://scraping.ualtarh.com`

## Deployment

### Quick Deploy
```bash
cd k3s-manifests/scripts
./deploy.sh
```

### Verify Deployment
```bash
./verify-deployment.sh
```

## Troubleshooting

### Check Traefik Services
```bash
kubectl get svc -n kube-system | grep traefik
```

### Check Traefik Pods
```bash
kubectl get pods -n kube-system | grep traefik
```

### Check Traefik Logs
```bash
kubectl logs -n kube-system deployment/traefik --tail=20
```

### Test Connectivity
```bash
# Test HTTP
curl -I http://192.168.1.181:30080

# Test HTTPS
curl -I -k https://192.168.1.181:30443
```

## Network Policies
The existing network policies have been updated to work with NodePort configuration. Traefik can access services on the required ports (3000, 4000, 8088, 3001, 4444).

## Rollback
If you need to rollback to LoadBalancer:
```bash
# Restore backup
cp k3s-manifests/traefik/helmChartConfig-traefik.yaml.backup k3s-manifests/traefik/helmChartConfig-traefik.yaml

# Reapply
kubectl apply -f k3s-manifests/traefik/helmChartConfig-traefik.yaml
kubectl rollout restart deployment/traefik -n kube-system
``` 