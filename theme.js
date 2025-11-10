document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'scrambleFinderTheme';
    const rootElement = document.documentElement;
    const themeToggleInput = document.getElementById('themeToggle');

    const getStoredTheme = () => localStorage.getItem(STORAGE_KEY);

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    };

    const applyTheme = (theme) => {
        rootElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        if (themeToggleInput) {
            themeToggleInput.checked = theme === 'dark';
        }
    };

    applyTheme(getPreferredTheme());

    if (themeToggleInput) {
        themeToggleInput.addEventListener('change', () => {
            const nextTheme = themeToggleInput.checked ? 'dark' : 'light';
            applyTheme(nextTheme);
        });
    }
});
