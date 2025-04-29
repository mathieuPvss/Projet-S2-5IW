import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/Home.vue';
import ResultsPage from '../views/Results.vue';
import RegisterPage from '@/views/RegisterPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import CguPage from '@/views/CguPage.vue'; 

const routes = [
  { path: '/', component: HomePage },
  { path: '/results/:query', component: ResultsPage, props: true },
  { path: '/register', component: RegisterPage },
  { path: '/login', component: LoginPage },
  { path: '/cgu', component: CguPage } 
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
