import {
    defineConfig,
    presetIcons,
    presetUno,
    presetWind,
    UserConfig,
    transformerDirectives,
} from 'unocss'

const config = {
    presets: [presetUno(), presetWind(), presetIcons()],
    shortcuts: [
        {
            'flex-center': 'flex justify-center items-center',
            'flex-col-center': 'flex flex-col justify-center items-center',
        },
    ],
    rules: [],
    theme: {
        colors: {
            white: '#fffcf5',
            black: '#0d1c10',
            green: '#005d30',
            transparent: 'transparent',
            gray: '#242d25',
            grey: '#242d25',
            yellow: '#fff0af',
            orange: '#f8a31f',
        },
        font: {
            sans: [
                'Barlow',
                'ui-sans-serif',
                'system-ui',
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                '"Noto Sans"',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
                '"Noto Color Emoji"',
            ],
            serif: [
                'ui-serif',
                'Georgia',
                'Cambria',
                '"Times New Roman"',
                'Times',
                'serif',
            ],
            mono: [
                'ui-monospace',
                'SFMono-Regular',
                'Menlo',
                'Monaco',
                'Consolas',
                '"Liberation Mono"',
                '"Courier New"',
                'monospace',
            ],
            heading: [
                'OpenSans',
                'ui-sans-serif',
                'system-ui',
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                '"Noto Sans"',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
                '"Noto Color Emoji"',
            ],
            display: [
                'Futura',
                'ui-sans-serif',
                'system-ui',
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                '"Noto Sans"',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
                '"Noto Color Emoji"',
            ],
        },
    },
    transformers: [transformerDirectives()],
}

export default defineConfig(config) as UserConfig<(typeof config)['theme']>
