import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useStorage, useWebSocket } from '@vueuse/core';
import { TheAnyThingBooking } from '@/scripts/types';

export const useTheAnyThingStore = defineStore('theanything', () => {
    const theAnyThingTheatreId = useStorage<string>('theanything-theatre-id', '')
    const bookings = ref<any[]>([]);
    const timestamp = ref<number>(0);

    const connectionUrl = computed(() => {
        if (!theAnyThingTheatreId.value) return undefined

        return `wss://ws.signage.theanything.com/?locationId=${theAnyThingTheatreId.value}`
    })

    const { status, data, send, open, close } = useWebSocket(
        connectionUrl,
        {
            immediate: true,
            autoReconnect: { retries: 5, delay: 3000, },
            // heartbeat: { message: '{"action":"getBookings"}', interval: 5 * 60 * 1000, pongTimeout: 5000, }
            onConnected(ws) {
                bookings.value = [];
                timestamp.value = 0;
                fetchBookingsAction()
            },
            onDisconnected(ws, event) {
                bookings.value = [];
                timestamp.value = 0;
            },
            onMessage(ws, event) {
                if (!event.data) return
                try {
                    const parsed = JSON.parse(event.data);

                    if (parsed) {
                        bookings.value = parsed.bookings || parsed;
                        timestamp.value = Date.now();
                    }
                } catch (error) {
                    console.error('Failed to parse incoming WebSocket message as JSON:', error)
                }
            }
        }
    )

    const fetchBookingsAction = () => {
        if (status.value === 'OPEN') {
            send(JSON.stringify({ action: 'getBookings' }))
        }
    }

    watch(connectionUrl, (newUrl, oldUrl) => {
        if (oldUrl) close()
        if (newUrl) open()
    })

    const flatBookings = computed<TheAnyThingBooking[]>(() => {
        // of every object in bookings, get both the now and the next object, and return them as a flat array
        return Object.values(bookings.value).flatMap((booking: any) => {
            return Object.values(booking).filter((v): v is any => !!v);
        }).map((booking: any) => {
            return {
                ...booking,
                bookingFrom: new Date(booking.bookingFrom),
                bookingUntil: new Date(booking.bookingUntil),
                bookingUntilNotRounded: new Date(booking.bookingUntilNotRounded),
            } as TheAnyThingBooking;
        });
    });

    return {
        theatreId: theAnyThingTheatreId,
        status,
        bookings,
        flatBookings,
        timestamp,
        triggerManualRefresh: fetchBookingsAction,
        close,
        open,
    }

})
