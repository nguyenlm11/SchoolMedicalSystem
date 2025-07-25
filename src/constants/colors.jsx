export const PRIMARY = {
    50: '#e6f7f7',
    100: '#ccefef',
    200: '#99dfdf',
    300: '#66cfcf',
    400: '#33bfbf',
    500: '#008080', // Main primary color
    600: '#006666',
    700: '#004d4d',
    800: '#003333',
    900: '#001a1a',
};

export const SECONDARY = {
    50: '#fff5e6',
    100: '#ffebcc',
    200: '#ffd799',
    300: '#ffc366',
    400: '#ffaf33',
    500: '#ff9b00',
    600: '#cc7c00',
    700: '#995d00',
    800: '#663e00',
    900: '#331f00',
};

export const GRAY = {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
};

export const SUCCESS = {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
};

export const WARNING = {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
};

export const ERROR = {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
};

export const INFO = {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
};

export const COMMON = {
    WHITE: '#ffffff',
    BLACK: '#000000',
    RED: '#ff0000',
    TRANSPARENT: 'transparent',
};

export const TEXT = {
    PRIMARY: GRAY[900],
    SECONDARY: GRAY[600],
    DISABLED: GRAY[400],
    INVERSE: COMMON.WHITE,
};

export const BACKGROUND = {
    DEFAULT: COMMON.WHITE,
    PAPER: COMMON.WHITE,
    NEUTRAL: GRAY[50],
    DISABLED: GRAY[100],
};

// Border colors
export const BORDER = {
    DEFAULT: GRAY[200],
    LIGHT: GRAY[100],
    DARK: GRAY[300],
};

export const SHADOW = {
    DEFAULT: 'rgba(0, 0, 0, 0.1)',
    LIGHT: 'rgba(0, 0, 0, 0.05)',
    MEDIUM: 'rgba(0, 0, 0, 0.15)',
    DARK: 'rgba(0, 0, 0, 0.25)',
};

export const COLORS = { PRIMARY, SECONDARY, GRAY, SUCCESS, WARNING, ERROR, INFO, COMMON, TEXT, BACKGROUND, BORDER, SHADOW, };

export default COLORS;
