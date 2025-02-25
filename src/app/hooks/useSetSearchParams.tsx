
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const useSetSearchParams = () => {
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const pathname = usePathname()

    function addParams(paramsObj: Record<string, string>) {
        const params = new URLSearchParams(searchParams)

        // Handle sort direction toggle
        if (paramsObj.sort_by) {
            const currentSortBy = params.get('sort_by')
            const currentOrder = params.get('order')

            if (currentSortBy === paramsObj.sort_by) {
                // Toggle order between asc and desc
                params.set('order', currentOrder === 'asc' ? 'desc' : 'asc')
            } else {
                // Default to desc for new sort column
                params.set('order', 'desc')
            }
        }

        // Set all params from the object
        for (const [key, value] of Object.entries(paramsObj)) {
            params.set(key, value)
        }

        const newPath = `${pathname}?${params.toString()}`
        replace(newPath, { scroll: false })
    }

    function addParam(action: SearchParamsAction, operator: string) {
        const params = new URLSearchParams(searchParams)
        console.log('The action', action)
        console.log('The operator', operator)

        if (operator === '') {
            params.delete(action)
        } else {
            params.set(action, operator)
        }

        let newPath = `${pathname}?${params.toString()}`
        if (!searchParams) {
            newPath = operator === '' ? pathname : `${action}?${action}=${operator}`
        }
        replace(newPath, { scroll: false })
    }

    const setParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        replace(`?${params.toString()}`, { scroll: false })
    }

    const removeSpecificParam = (keys: string[]) => {
        const params = new URLSearchParams(searchParams.toString())
        keys.forEach(key => params.delete(key))
        replace(`?${params.toString()}`, { scroll: false })
    }

    function removeAndAddParams(removeActions: SearchParamsAction[], addParamsObj: Record<string, string>) {
        const params = new URLSearchParams(searchParams)
        removeActions.forEach(action => params.delete(action))
        Object.entries(addParamsObj).forEach(([key, value]) => params.set(key, value))
        const newPath = `${pathname}?${params.toString()}`
        replace(newPath, { scroll: false })
    }

    return { addParam, removeSpecificParam, removeAndAddParams, addParams, setParam }
}

export default useSetSearchParams
