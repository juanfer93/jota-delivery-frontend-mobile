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
        jj: {
          blue: '#174A8B',
          blueDark: '#102F59',
          beige: '#F5E9C8',
          beigeSoft: '#FFF9E8',
        },
        jjBlue: '#174A8B',
        jjBlueDark: '#102F59',
        jjBeige: '#F5E9C8',
        jjBeigeSoft: '#FFF9E8',
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