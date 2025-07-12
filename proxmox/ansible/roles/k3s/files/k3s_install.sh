#!/bin/bash
set -e
K3S_VERSION="v1.31.6+k3s1"

echo "Vérification de la présence d'une ancienne installation K3s..."
if systemctl is-active --quiet k3s; then
  echo "  ➜ K3s est déjà installé et actif, on le supprime..."
  if [ -f /usr/local/bin/k3s-uninstall.sh ]; then
    /usr/local/bin/k3s-uninstall.sh
  else
    systemctl stop k3s || true
    systemctl disable k3s || true
    rm -f /etc/systemd/system/k3s.service
    rm -f /usr/local/bin/k3s
    rm -f /usr/local/bin/kubectl
    rm -f /usr/local/bin/crictl
    rm -f /usr/local/bin/k3s-killall.sh
    rm -f /usr/local/bin/k3s-uninstall.sh
  fi
fi

echo "  ➜ Suppression des anciens dossiers K3s..."
sudo rm -rf /var/lib/rancher/k3s
sudo rm -rf /etc/rancher/k3s

echo "Mise à jour du système et installation des dépendances..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl iptables jq conntrack socat


echo "Chargement des modules noyau requis (br_netfilter, overlay)..."
sudo modprobe br_netfilter
sudo modprobe overlay

echo "Configuration pour les charger au démarrage..."
cat <<EOF | sudo tee /etc/modules-load.d/k3s.conf
br_netfilter
overlay
EOF

echo "Installation de K3s (etcd intégré)..."
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=$K3S_VERSION sh -s - server \
  --cluster-init \
  --disable servicelb \
  --flannel-backend=host-gw \
  --tls-san=$(hostname -I | awk '{print $1}') \
  --write-kubeconfig-mode 644


echo "Attente de la disponibilité du cluster..."
sleep 15
sudo kubectl get nodes -o wide

echo "Installation terminée !"
echo "Kubeconfig : /etc/rancher/k3s/k3s.yaml"
echo "Pour vérifier le cluster : kubectl get nodes && kubectl get pods -A"
