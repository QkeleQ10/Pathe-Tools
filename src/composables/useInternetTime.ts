import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useInternetTime() {
    const adjustedTime = ref(new Date());
    let timeDifference = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchInternetTime = async () => {
        try {
            const response = await fetch('https://time.now/developer/api/timezone/Europe/Amsterdam');
            const data = await response.json();
            const internetTime = new Date(data.datetime);
            const localTime = new Date();
            timeDifference = internetTime.getTime() - localTime.getTime();
            console.log('Time difference between local and internet time:', timeDifference, 'ms');
        } catch (error) {
            console.warn('Failed to fetch internet time, using local time:', error);
            timeDifference = 0;
        }
    };

    const updateNowValue = () => {
        adjustedTime.value = new Date(Date.now() + timeDifference);
    };

    onMounted(async () => {
        await fetchInternetTime();
        updateNowValue();
        intervalId = setInterval(updateNowValue, 1000);
    });

    onBeforeUnmount(() => {
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
    });

    return adjustedTime;
}
