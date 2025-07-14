terraform {
  required_providers {
    proxmox = {
      source  = "telmate/proxmox"
    }
  }
}

variable "name" {}
variable "target_node" {}
variable "vmid" {}
variable "template" {}
variable "memory" {}
variable "cpu_cores" {}
variable "ip_address" {}
variable "rootfs_size" {
  default = "20G"
}
variable "ssh_pubkey" {}
variable "database_type" {
  description = "Type of database (postgres or elasticsearch)"
  default     = "postgres"
}

variable "password" {
  description = "Password for the k3s user"
  sensitive   = true
}

resource "proxmox_lxc" "this" {
  hostname     = var.name
  target_node  = var.target_node
  vmid         = var.vmid
  ostemplate   = var.template
  unprivileged = true
  onboot       = true
  start        = true
  
  memory = var.memory
  cores  = var.cpu_cores
  
  rootfs {
    storage = "local"
    size    = var.rootfs_size
  }
  
  network {
    name   = "eth0"
    bridge = "vmbr0"
    ip     = "${var.ip_address}/24"
    gw     = "192.168.1.107"
  }
  
  features {
    nesting = true
    mount   = "nfs;cifs"
  }
  
  ssh_public_keys = var.ssh_pubkey
  
  # Set root password
  password = var.password
}

output "name" {
  value = proxmox_lxc.this.hostname
}

output "ip_address" {
  value = var.ip_address
}

output "vmid" {
  value = proxmox_lxc.this.vmid
}

# Setup SSH and create k3s user after container is created
resource "null_resource" "setup_ssh_and_user" {
  depends_on = [proxmox_lxc.this]

  provisioner "local-exec" {
    command = <<-EOT
      # Wait for container to be ready
      sleep 30
      
      # Fix DNS resolution by setting nameserver to pihole
      pct exec ${proxmox_lxc.this.vmid} -- bash -c "echo 'nameserver 192.168.1.107' > /etc/resolv.conf"
      
      # Install sudo and SSH server
      pct exec ${proxmox_lxc.this.vmid} -- apt update
      pct exec ${proxmox_lxc.this.vmid} -- apt install -y sudo openssh-server
      
      # Configure SSH to allow root login with password
      pct exec ${proxmox_lxc.this.vmid} -- sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
      pct exec ${proxmox_lxc.this.vmid} -- sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
      
      # Restart SSH service
      pct exec ${proxmox_lxc.this.vmid} -- systemctl restart ssh
      pct exec ${proxmox_lxc.this.vmid} -- systemctl enable ssh
      
      # Create k3s user and add to sudo group
      pct exec ${proxmox_lxc.this.vmid} -- useradd -m -s /bin/bash k3s
      pct exec ${proxmox_lxc.this.vmid} -- bash -c "echo 'k3s:${var.password}' | chpasswd"
      pct exec ${proxmox_lxc.this.vmid} -- usermod -aG sudo k3s
      
      # Create sudoers.d directory if it doesn't exist and add k3s user
      pct exec ${proxmox_lxc.this.vmid} -- mkdir -p /etc/sudoers.d
      pct exec ${proxmox_lxc.this.vmid} -- bash -c "echo 'k3s ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/k3s"
      pct exec ${proxmox_lxc.this.vmid} -- chmod 440 /etc/sudoers.d/k3s
    EOT
  }
}
