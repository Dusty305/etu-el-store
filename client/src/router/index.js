import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const authRoute = {
    path: '/auth',
    name: 'Авторизация',
    component: () => import('../pages/AuthPage.vue')
};

const routes = [
    authRoute,
    {
        path: '/',
        component: () => import('../pages/user/UserPage.vue'),
        children: [
            {
                path: 'main',
                name: 'Главная страница',
                component: () => import('../pages/shared/MainSubPage.vue'),
                meta: { requiresAuth: false }
            },
            {
                path: 'profile',
                name: 'Профиль',
                component: () => import('../pages/shared/ProfileSubPage.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'cart',
                name: 'Корзина',
                component: () => import('../pages/user/CartSubPage.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'product/:productId',
                name: 'Продукты',
                component: () => import('../pages/shared/ProductSubPage.vue'),
                meta: { requiresAuth: false }
            },
            {
                path: '',
                redirect: { name: 'Главная страница' }
            }
        ]
    },
    {
        path: '/admin',
        name: 'Админ панель',
        component: () => import('../pages/admin/AdminPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: 'profile',
                name: 'ПрофильАдмин',
                component: () => import('../pages/shared/ProfileSubPage.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'products',
                name: 'Товары',
                component: () => import('../pages/admin/ProductsSubPage.vue'),
            },
            {
                path: 'orders',
                name: 'Заказы',
                component: () => import('../pages/admin/OrdersSubPage.vue'),
            },
            {
                path: 'categories',
                name: 'Категории',
                component: () => import('../pages/admin/CategoriesSubPage.vue'),
            },
            {
                path: '',
                redirect: { name: 'Товары' }
            },
            {
                path: 'users',
                name: 'Пользователи',
                component: () => import('../pages/admin/UsersSubPage.vue'),
            }
        ]
    },
    // FIXME тут похоже нужен еще отдельный маршрут для uploads, так как иначе картинки тупо не грузятся
    // Но непонятно, как сделать так, чтобы работал проброс до сервера
    // {
    //     path: '/uploads/:pathMatch(.*)*',
    //     name: 'Ресурсы',
    // },
    {
        // Все остальные маршруты перенаправляем на главную страницу    
        path: '/:pathMatch(.*)*',
        redirect: { name: 'Главная страница' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.name === authRoute.name && authStore.isAuthenticated) {
        return { name: 'Главная страница' };
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: 'Авторизация' };
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return { name: 'Главная страница' };
    }

    return true;
});

export default router;