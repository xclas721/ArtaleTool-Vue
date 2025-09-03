import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import KeyboardPage from "../views/KeyboardPage.vue";
import MousePage from "../views/MousePage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/keyboard",
    name: "Keyboard",
    component: KeyboardPage,
  },
  {
    path: "/mouse",
    name: "Mouse",
    component: MousePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
