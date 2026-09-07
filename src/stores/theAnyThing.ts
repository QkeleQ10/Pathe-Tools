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
                console.log('WebSocket message received:', event.data);
                if (!event.data) return
                try {
                    const parsed = JSON.parse(event.data);

                    if (parsed?.bookings) updateBookings(parsed.bookings);
                    if (parsed?.status) updateStatus(parsed.status);
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

    function updateBookings(data: BookingsData) {
        const newBookings = flattenBookings(data);
        bookings.value = mergeBookings(newBookings, bookings.value);
        timestamp.value = Date.now();
    }

    function updateStatus(data: { bookingId: string, duration: string, locationId: string, pauseRemaining: string, playerState: string, progress: string, roomId: string }) {
        const booking = bookings.value.find(b => b.bookingId === data.bookingId);
        if (!booking) return;

        const durationMs = durationToMs(data.duration);
        const pauseRemainingMs = durationToMs(data.pauseRemaining);
        const progressMs = durationToMs(data.progress);

        let estimatedTimeRemaining;

        if (durationMs === 0 || progressMs === durationMs || data.playerState === 'cleared' || (data.playerState === 'stop' && progressMs === 0)) {
            estimatedTimeRemaining = 1000;
        } else {
            estimatedTimeRemaining = durationMs - progressMs + pauseRemainingMs;
        }

        const estimatedEndTime = new Date(Math.min(
            Date.now() + estimatedTimeRemaining,
            booking.bookingUntilNotRounded.getTime(),
        ));

        if (estimatedEndTime > booking.estimatedEndTime || estimatedEndTime.getTime() < Date.now()) return;

        console.log(`Updating estimated end time for booking ${booking.bookingId} \nfrom ${booking.estimatedEndTime.toISOString()} \n  to ${estimatedEndTime.toISOString()}`);

        booking.estimatedEndTime = estimatedEndTime;
    }

    function flattenBookings(bookingsObj: BookingsData): TheAnyThingBooking[] {
        // of every object in bookings, get both the now and the next object, and return them as a flat array
        const flattenedBookings = Object.values(bookingsObj).flatMap((booking: any) => {
            return Object.values(booking).filter((v): v is any => !!v);
        }).map((booking: any) => {
            return {
                ...booking,
                bookingFrom: new Date(booking.bookingFrom),
                bookingUntil: new Date(booking.bookingUntil),
                bookingUntilNotRounded: new Date(booking.bookingUntilNotRounded),
                estimatedEndTime: new Date(booking.bookingUntilNotRounded),
                nextBookingStartTime: null,
            } as TheAnyThingBooking;
        });

        return flattenedBookings.map(booking => {
            const nextBooking = flattenedBookings
                .filter(candidate =>
                    candidate.roomId === booking.roomId &&
                    candidate.bookingFrom.getTime() > booking.bookingFrom.getTime()
                )
                .sort((a, b) => a.bookingFrom.getTime() - b.bookingFrom.getTime())[0];

            return {
                ...booking,
                nextBookingStartTime: nextBooking?.bookingFrom ?? null,
            };
        });
    }

    function mergeBookings(
        newBookings: TheAnyThingBooking[],
        currentBookings: TheAnyThingBooking[],
    ): TheAnyThingBooking[] {
        const newBookingIds = new Set(newBookings.map(booking => booking.bookingId));
        const currentBookingsById = new Map(currentBookings.map(booking => [booking.bookingId, booking]));
        const now = Date.now();
        const ongoingBookings = currentBookings.filter(booking =>
            !newBookingIds.has(booking.bookingId) &&
            booking.bookingFrom.getTime() < now &&
            (booking.bookingUntilNotRounded.getTime() + 300000) > now
        );

        const updatedBookings = newBookings.map(booking => {
            const currentBooking = currentBookingsById.get(booking.bookingId);
            return currentBooking
                ? { ...booking, estimatedEndTime: currentBooking.estimatedEndTime }
                : booking;
        });

        return [...updatedBookings, ...ongoingBookings];
    }

    function durationToMs(duration: string): number {
        const [hours, minutes, seconds] = duration.split(':').map(Number);

        return (hours * 3600 + minutes * 60 + seconds) * 1000;
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
