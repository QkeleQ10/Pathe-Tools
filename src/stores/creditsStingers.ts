import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useServerStore } from './server'

export const useCreditsStingersStore = defineStore('creditsStingers', () => {
    const stingers = ref<string[]>([])
    const serverStore = useServerStore()

    async function getStingers(): Promise<void> {
        try {
            const response = await fetch(`${serverStore.url}/global/creditsstingers`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            })
            if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`)

            const data = await response.json()
            stingers.value = Array.isArray(data) ? data : []
        } catch (error) {
            console.error("Error getting stingers from server:", error)
            throw error
        }
    }

    async function addStinger(title: string): Promise<void> {
        try {
            const response = await fetch(`${serverStore.url}/global/creditsstingers`, {
                method: 'POST',
                headers: {
                    Authorization: 'Basic ' + btoa(`${serverStore.username}:${serverStore.password}`),
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ title })
            })
            if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`)

            await getStingers() // Refresh the list
        } catch (error) {
            console.error("Error adding stinger:", error)
            throw error
        }
    }

    async function deleteStinger(title: string): Promise<void> {
        try {
            const response = await fetch(`${serverStore.url}/global/creditsstingers`, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Basic ' + btoa(`${serverStore.username}:${serverStore.password}`),
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ title })
            })
            if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`)

            await getStingers() // Refresh the list
        } catch (error) {
            console.error("Error deleting stinger:", error)
            throw error
        }
    }

    return { stingers, getStingers, addStinger, deleteStinger }
})