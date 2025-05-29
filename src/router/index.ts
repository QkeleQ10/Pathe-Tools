/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

import { createRouter, createWebHistory, RouteRecordRaw, RouterScrollBehavior } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TimetableView from '../views/TimetableView.vue';
import AnnouncerView from '../views/AnnouncerView.vue';
import NarrowcastingView from '../views/NarrowcastingView.vue';
import SlideshowView from '../views/SlideshowView.vue';
import IntermissionFinderView from '../views/IntermissionFinderView.vue';
import SplitscreenView from '../views/SplitscreenView.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/timetable',
        name: 'timetable',
        component: TimetableView,
        meta: {
            title: 'Tijdenlijstje',
        }
    },
    {
        path: '/announcer',
        name: 'announcer',
        component: AnnouncerView,
        meta: {
            title: 'Omroepen',
        }
    },
    {
        path: '/narrowcasting',
        name: 'narrowcasting',
        component: NarrowcastingView,
        meta: {
            title: 'Timetable',
        }
    },
    {
        path: '/slideshow',
        name: 'slideshow',
        component: SlideshowView,
        meta: {
            title: 'Diavoorstelling',
        }
    },
    {
        path: '/intermission-finder',
        name: 'intermission-finder',
        component: IntermissionFinderView,
        meta: {
            title: 'Filmpauze',
        }
    },
    {
        path: '/splitscreen',
        name: 'splitscreen',
        component: SplitscreenView,
        meta: {
            title: 'Filmpauze',
            showNavigation: false, // Hide header for splitscreen view
            // overlayHeader: true, // Show overlay header for splitscreen view
            showFooter: false, // Hide footer for splitscreen view
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

export { routes }; // Export routes for use in other parts of the application