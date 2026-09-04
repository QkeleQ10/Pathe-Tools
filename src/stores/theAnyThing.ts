import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useStorage, useWebSocket } from '@vueuse/core';
import { TheAnyThingBooking } from '@/scripts/types';

type BookingsDataObject = {
    bookingId: string;
    productName: string;
    locationName: string;
    roomId: string;
    roomName: string;
    roomNumber: number;
    roomDirection: string;
    userGivenName: string;
    bookingFrom: string;
    bookingUntil: string;
    bookingUntilNotRounded: string;
    bookingState: string;
}

type BookingsData = {
    [roomId: number]: {
        now: BookingsDataObject | null;
        next: BookingsDataObject | null;
    }
}

export const useTheAnyThingStore = defineStore('theanything', () => {
    const theAnyThingTheatreId = useStorage<string>('theanything-theatre-id', '')
    const bookings = ref<TheAnyThingBooking[]>([]);
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
            heartbeat: { message: '{"action":"getBookings"}', interval: 5 * 60 * 1000, pongTimeout: 5000, },
            onConnected(ws) {
                console.log('WebSocket connected:', ws)
                fetchBookingsAction()
            },
            onDisconnected(ws, event) {
                console.log('WebSocket disconnected:', event)
            },
            onMessage(ws, event) {
                console.log('WebSocket message received:', event.data)
                if (!event.data) return
                try {
                    const parsed = JSON.parse(event.data);

                    if (parsed?.bookings) {
                        const bookingsData: BookingsData = parsed.bookings;
                        const newBookings = flattenBookings(bookingsData);
                        bookings.value = mergeBookings(newBookings, bookings.value);
                        timestamp.value = Date.now();
                    }
                } catch (error) {
                    console.error('Failed to parse incoming WebSocket message as JSON:', error)
                }
            },
            onError(ws, event) {
                console.error('WebSocket error:', event)
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

    function flattenBookings(bookingsObj: BookingsData): TheAnyThingBooking[] {
        // of every object in bookings, get both the now and the next object, and return them as a flat array
        return Object.values(bookingsObj).flatMap((booking: any) => {
            return Object.values(booking).filter((v): v is any => !!v);
        }).map((booking: any) => {
            return {
                ...booking,
                bookingFrom: new Date(booking.bookingFrom),
                bookingUntil: new Date(booking.bookingUntil),
                bookingUntilNotRounded: new Date(booking.bookingUntilNotRounded),
            } as TheAnyThingBooking;
        });
    }

    function mergeBookings(
        newBookings: TheAnyThingBooking[],
        currentBookings: TheAnyThingBooking[],
    ): TheAnyThingBooking[] {
        const newBookingIds = new Set(newBookings.map(booking => booking.bookingId));
        const now = Date.now();
        const ongoingBookings = currentBookings.filter(booking =>
            !newBookingIds.has(booking.bookingId) &&
            booking.bookingFrom.getTime() < now &&
            (booking.bookingUntilNotRounded.getTime() + 300000) > now
        );

        return [...newBookings, ...ongoingBookings];
    }

    return {
        theatreId: theAnyThingTheatreId,
        status,
        bookings,
        timestamp,
        triggerManualRefresh: fetchBookingsAction,
        close,
        open,
    }

})
