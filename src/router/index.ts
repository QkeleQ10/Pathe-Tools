/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

import { createRouter, createWebHistory, RouteRecordRaw, RouterScrollBehavior } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/timetable',
        name: 'timetable',
        component: () => import('../views/TimetableView.vue'),
        meta: {
            title: 'Tijdenlijstje',
        }
    },
    {
        path: '/announcer',
        name: 'announcer',
        component: () => import('../views/AnnouncerView.vue'),
        meta: {
            title: 'Omroepen',
        }
    },
    {
        path: '/narrowcasting',
        name: 'narrowcasting',
        component: () => import('../views/NarrowcastingView.vue'),
        meta: {
            title: 'Zaalverwijzer',
        }
    },
    {
        path: '/slideshow',
        name: 'slideshow',
        component: () => import('../views/SlideshowView.vue'),
        meta: {
            title: 'Diavoorstelling',
        }
    },
    {
        path: '/intermission-finder',
        name: 'intermission-finder',
        component: () => import('../views/IntermissionFinderView.vue'),
        meta: {
            title: 'Filmpauze',
        }
    }
];

const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
    if (to.hash) {
        return {
            el: to.hash,
            behavior: 'smooth',
        };
    } else {
        return {
            top: 0,
            behavior: 'smooth',
        };
    }
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior,
});

router.beforeEach((to, from) => {
    document.title = to.meta?.title ? `${to.meta.title} - Pathé Tools` : 'Pathé Tools';
});

export default router;
