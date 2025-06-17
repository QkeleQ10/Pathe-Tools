/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

import { createRouter, createWebHistory, RouteRecordRaw, RouterScrollBehavior } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SplitscreenView from '../views/SplitscreenView.vue';
import UsheringScheduleView from '../views/ushering/ScheduleView.vue';
import UsheringAnnouncerView from '../views/ushering/AnnouncerView.vue';
import NarrowcastingTimetableView from '../views/narrowcasting/TimetableView.vue';
import NarrowcastingSlideshowView from '../views/narrowcasting/SlideshowView.vue';
import PocIntermissionView from '../views/poc/IntermissionView.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            largeHero: true,
        }
    },
    {
        path: '/timetable',
        redirect: '/ushering/schedule'
    },
    {
        path: '/ushering/schedule',
        name: 'ushering-schedule',
        component: UsheringScheduleView,
        meta: {
            title: 'Tijdenlijstje',
        }
    },
    {
        path: '/announcer',
        redirect: '/ushering/announcer'
    },
    {
        path: '/ushering/announcer',
        name: 'ushering-announcer',
        component: UsheringAnnouncerView,
        meta: {
            title: 'Omroepen',
        }
    },
    {
        path: '/narrowcasting',
        redirect: '/narrowcasting/timetable'
    },
    {
        path: '/narrowcasting/timetable',
        name: 'narrowcasting-timetable',
        component: NarrowcastingTimetableView,
        meta: {
            title: 'Timetable',
        }
    },
    {
        path: '/slideshow',
        redirect: '/narrowcasting/slideshow'
    },
    {
        path: '/narrowcasting/slideshow',
        name: 'narrowcasting-slideshow',
        component: NarrowcastingSlideshowView,
        meta: {
            title: 'Diavoorstelling',
        }
    },
    {
        path: '/intermission-finder',
        redirect: '/poc/intermission'
    },
    {
        path: '/poc/intermission',
        name: 'poc-intermission',
        component: PocIntermissionView,
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
            showNavigation: false,
            showFooter: false,
            smallHero: true,
            heroZeroHeight: true,
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