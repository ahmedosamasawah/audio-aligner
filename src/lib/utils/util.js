// @ts-nocheck
import {clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function flyAndScale(node, options = {}) {
    const style = getComputedStyle(node)
    const transform = style.transform === 'none' ? '' : style.transform

    return {
        duration: options.duration || 150,
        css: t => {
            const scale = 0.95 + 0.05 * t
            const opacity = t
            const y = (1 - t) * (options.y || 5)

            return `
                transform: ${transform} scale(${scale}) translate(0, ${y}px);
                opacity: ${opacity};
            `
        },
    }
}
