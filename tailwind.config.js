/** إعدادات Tailwind — محتوى الملفات التي تُمسح منها الأصناف المستخدمة */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1d9e75',
          dark: '#0f6e56',
          light: '#e1f5ee',
        },
        surface: {
          DEFAULT: '#faf9f7',
          card: '#ffffff',
          muted: '#f5f4f0',
        },
      },
    },
  },
  plugins: [],
}
