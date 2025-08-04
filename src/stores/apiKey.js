import * as kv from 'idb-keyval'
import {writable} from 'svelte/store'

import {parse_api_keys_from_url} from '$lib/utils/url-params.js'

export const api_key = writable('')
export const api_key_available = writable(false)

export async function init_api_key() {
    parse_api_keys_from_url()

    const stored_key = await kv.get('utils_api_key')
    if (stored_key) {
        api_key.set(stored_key)
        api_key_available.set(true)
    } else {
        api_key_available.set(false)
    }
}

/**
 * @param {string} key
 */
export async function validate_api_key(key) {
    if (!key || !key.trim()) return false

    try {
        const response = await fetch(window.CONFIG.UTILS_API_URL + `/echo?api_key=${key.trim()}`)
        return response.ok
    } catch (error) {
        console.error('Error validating API key:', error)
        return false
    }
}

/**
 * @param {string} key
 */
export async function save_api_key(key) {
    if (!key || !key.trim()) return false

    const cleaned_key = key.trim()
    const is_valid = await validate_api_key(cleaned_key)

    if (is_valid) {
        await kv.set('utils_api_key', cleaned_key)
        api_key.set(cleaned_key)
        api_key_available.set(true)
        return true
    }

    return false
}

export async function clear_api_key() {
    await kv.set('utils_api_key', '')
    api_key.set('')
    api_key_available.set(false)
}
