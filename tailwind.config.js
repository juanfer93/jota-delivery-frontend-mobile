/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', 
          dark: '#1d4ed8',    
          light: '#dbeafe',   
        },
        neutral: {
          dark: '#111827',    
          card: '#ffffff',    
          gray: '#6b7280',    
          light: '#f3f4f6',   
        },
        
        status: {
          proceso: '#eab308',   
          hecho: '#10b981',     
          cancelado: '#ef4444', 
        }
      }
    },
  },
  plugins: [],
}