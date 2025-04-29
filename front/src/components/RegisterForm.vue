<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Créer un compte</h2>
      <form @submit.prevent="submitForm">
        <input type="text" v-model="form.name" placeholder="Nom complet" required />
        <input type="email" v-model="form.email" placeholder="Adresse e-mail" required />
        <input type="password" v-model="form.password" placeholder="Mot de passe" required />
        <input type="password" v-model="form.confirmPassword" placeholder="Confirmer le mot de passe" required />
  
        <button type="submit">S'inscrire</button>
      </form>
      <p class="login-redirect">Déjà un compte ? <a href="/login">Se connecter</a></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    submitForm() {
      if (this.form.password !== this.form.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }

      // Simule un envoi de données
      console.log('Formulaire soumis :', this.form);
      alert('Compte créé avec succès !');
    }
  }
}
</script>

<style scoped>

body.dark-mode {
  background-color: #1a202c;
}

/* Register container */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.register-card {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.register-card h2 {
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

.login-redirect {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.login-redirect a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

/* Dark Mode */
body.dark-mode .register-card {
  background-color: #2d3748;
}

body.dark-mode .register-card h2 {
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

body.dark-mode .login-redirect a {
  color: #667eea;
}
</style>
