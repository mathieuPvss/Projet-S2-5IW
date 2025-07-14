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
variable "clone" {}
variable "memory" {}
variable "cpu_cores" {}
variable "cpu_type" {}
variable "ip_address" {}
variable "cipassword" {
  sensitive = true
}
variable "ssh_pubkey" {}

resource "proxmox_vm_qemu" "this" {
  name        = var.name
  target_node = var.target_node
  vmid        = var.vmid
  clone       = var.clone
  full_clone  = true

  memory  = var.memory
  scsihw  = "virtio-scsi-pci"
  bootdisk = "scsi0"

  cpu {
    cores = var.cpu_cores
    type  = var.cpu_type
  }

  disks {
    ide {
      ide1 {
        cloudinit {
          storage = "local"
        }
      }
    }

    scsi {
      scsi0 {
        disk {
            storage = "local"
            size    = "32G"
        }
      }
    }
  }

  network {
    id     = 0
    model  = "virtio"
    bridge = "vmbr0"
  }

  ipconfig0  = "ip=${var.ip_address}/24,gw=192.168.1.1"
  os_type    = "cloud-init"
  ciuser     = "k3s"
  cipassword = var.cipassword

  sshkeys = var.ssh_pubkey
}
output "name" {
  value = proxmox_vm_qemu.this.name
}

output "ip_address" {
  value = var.ip_address
}