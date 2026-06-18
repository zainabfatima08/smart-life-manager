import type { Config } from 'tailwindcss';
const config: Config = { darkMode: ['class', '.dark'], content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { void: '#050711', nebula: '#8b5cf6', plasma: '#22d3ee', apple: '#f5f5f7' }, boxShadow: { glow: '0 0 60px rgba(139,92,246,.28)' } } }, plugins: [] };
export default config;