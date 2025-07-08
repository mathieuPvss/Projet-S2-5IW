output "k3s_hosts" {
  value = {
    for name, vm in module.k3s_nodes :
    name => {
      name = vm.name
      ip   = vm.ip_address
    }
  }
}