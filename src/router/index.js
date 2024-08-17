import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
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
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        // if (savedPosition) {
        //     return savedPosition
        // } else
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        } else {
            return {
                top: 0,
                behavior: 'smooth',
            }
        }
    },
})

router.beforeEach((to, from) => {
    document.title = to.meta?.title ?? 'Pathé Tools'
})

export default router
