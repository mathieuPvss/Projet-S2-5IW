# Déploiement de l’environnement

## Avec un script bash 

Téléchargement : 

```bash
git clone https://github.com/vlaine5/k3s-install.git
```


**N'oubliez pas d'ajuster les variables au début du script !!!!!!!!!**

Puis : 
```bash
chmod +x install_k3s.sh
./install_k3s.sh
```

Pour activer l'auto-complétion et l'alias `k` pour la commande `kubectl` : 

``` bash
echo 'source <(kubectl completion bash)' >>~/.bashrc
echo 'alias k=kubectl' >>~/.bashrc
echo 'complete -o default -F __start_kubectl k' >>~/.bashrc
source ~/.bashrc
```


# Ajouter des noeuds

Nous allons utiliser ce petit script qui en fonction d'un paramètre va ajouter un nouveau noeud soit worker soit control-plane.  

D'abord récupérer le token de votre master avec cette commande : 

```bash
cat /var/lib/rancher/k3s/server/node-token
```

Puis le copier dans la variable TOKEN du script avant de le lancer.

Sur votre nouveau nœud, lancez ensuite le script soit pour ajouter un worker soit pour ajouter un control-plane.

```bash
./join_node.sh server
# ou
./join_node.sh agent
```

Vérifier ensuite l'ajout avec :

```bash
kubectl get nodes
```

```bash
NAME      STATUS   ROLES                       AGE    VERSION
sk3s-01   Ready    control-plane,etcd,master   55m    v1.31.6+k3s1
sk3s-02   Ready    control-plane,etcd,master   29m    v1.31.6+k3s1
sk3s-03   Ready    control-plane,etcd,master   27m    v1.31.6+k3s1
sk3s-04   Ready    <none>                      102s   v1.31.6+k3s1
```

Si vous voulez ajouter un rôle à votre worker : 

```
kubectl label node sk3s-04 node-role.kubernetes.io/worker=
```

```bash
NAME      STATUS   ROLES                       AGE    VERSION
sk3s-01   Ready    control-plane,etcd,master   55m    v1.31.6+k3s1
sk3s-02   Ready    control-plane,etcd,master   29m    v1.31.6+k3s1
sk3s-03   Ready    control-plane,etcd,master   27m    v1.31.6+k3s1
sk3s-04   Ready    worker                      102s   v1.31.6+k3s1
```

## Ajouter vos noeud à /etc/hosts

Il faut idéalement un serveur DNS pour la résolution de nom. Mais ici nous ajouterons simplement nos noeud si nécessaire à /etc/hosts comme ceci, à adatper à vos noms et IPs : 

```bash
cat /etc/hosts
127.0.0.1       localhost
192.168.1.175   sk3s-01.vlne.lan        sk3s-01
192.168.1.176   sk3s-02.vlne.lan        sk3s-02
192.168.1.177   sk3s-03.vlne.lan        sk3s-03
192.168.1.179   sk3s-04.vlne.lan        sk3s-04
```

