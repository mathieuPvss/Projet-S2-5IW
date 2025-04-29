<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Connexion</h2>
      <form @submit.prevent="submitLogin">
        <input type="email" v-model="email" placeholder="Email" required />
        <input type="password" v-model="password" placeholder="Mot de passe" required />
        <button type="submit">Se connecter</button>
        <p class="register-redirect">Pas encore de compte ? <router-link to="/register">Inscrivez-vous</router-link></p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    submitLogin() {
      console.log('Tentative de connexion avec :', this.email, this.password);
      alert('Connexion simulée.');
    }
  }
}
</script>

<style scoped>

body.dark-mode {
  background-color: #1a202c;
}

/* Login container */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.login-card {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-card h2 {
  margin-bottom: 1rem;
  color: #333;
}

form {
  display: flex;
  flex-direction: column;
}

input {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

button {
  padding: 0.75rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #5a67d8;
}

.register-redirect {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.register-redirect a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

/* Dark Mode */
body.dark-mode .login-card {
  background-color: #2d3748;
}

body.dark-mode .login-card h2 {
  color: white;
}

body.dark-mode form input {
  background-color: #4a5568;
  color: white;
  border-color: #718096;
}

body.dark-mode form input:focus {
  border-color: #667eea;
}

body.dark-mode button {
  background-color: #667eea;
}

body.dark-mode button:hover {
  background-color: #5a67d8;
}

body.dark-mode .register-redirect a {
  color: #667eea;
}

/* Responsive Mobile */
@media (max-width: 600px) {
  .login-card {
    padding: 1.5rem;
  }
}
</style>
