#!/bin/bash

# Script to generate SSH keys for all VMs
# This script will connect to each VM and generate an SSH key pair

echo "Generating SSH keys for all VMs..."

# Read the inventory file to get VM IPs
MASTER_IP="192.168.1.181"
WORKER_IPS=("192.168.1.182" "192.168.1.183")

# Function to generate SSH key on a VM
generate_ssh_key() {
    local ip=$1
    local user="k3s"
    
    echo "Generating SSH key on $ip..."
    
    # Generate SSH key without passphrase
    ssh -o StrictHostKeyChecking=no $user@$ip << 'EOF'
        if [ ! -f ~/.ssh/id_rsa ]; then
            ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa -N ""
            echo "SSH key generated successfully"
            echo "Public key:"
            cat ~/.ssh/id_rsa.pub
        else
            echo "SSH key already exists"
            echo "Public key:"
            cat ~/.ssh/id_rsa.pub
        fi
EOF
}

# Generate keys for master
echo "=== Master Node ==="
generate_ssh_key $MASTER_IP

# Generate keys for workers
echo -e "\n=== Worker Nodes ==="
for ip in "${WORKER_IPS[@]}"; do
    generate_ssh_key $ip
    echo ""
done

echo "SSH key generation completed!" 