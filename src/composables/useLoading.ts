import { ref } from 'vue'

const isLoading = ref(false)

export function useLoading() {
  const setLoading = (value: boolean) => {
    isLoading.value = value
  }

  return {
    isLoading,
    setLoading
  }
}
