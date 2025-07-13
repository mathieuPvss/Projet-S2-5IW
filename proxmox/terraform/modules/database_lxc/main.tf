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

resource "proxmox_lxc" "this" {
  hostname     = var.name
  target_node  = var.target_node
  vmid         = var.vmid
  template     = var.template
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
    gw     = "192.168.1.1"
  }
  
  features {
    nesting = true
    mount   = "nfs;cifs"
  }
  
  ssh_public_keys = var.ssh_pubkey
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