import React, { useState, useMemo, useEffect } from 'react';
// Logo image removed for cleaner SVG approach
import { 
  Plus, Trash2, Settings, Flame, ChevronRight, Search, X, Check, 
  Scale, ArrowLeft, Sun, Moon, Cookie, Activity, 
  Smile, Dumbbell, AlertTriangle, User, RefreshCcw, 
  TrendingUp, TrendingDown, Camera, ScanLine, ImageIcon, Edit2, 
  Coffee, Target, Zap, Lock, LogIn, Database, Download
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, deleteDoc, writeBatch, getDocs, query, limit } from "firebase/firestore";

// --- INICIALIZACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCUboqnGvWYzzMMUYSeTQm1c6SoIhvwk7w",
  authDomain: "mi-deficit-app.firebaseapp.com",
  projectId: "mi-deficit-app",
  storageBucket: "mi-deficit-app.firebasestorage.app",
  messagingSenderId: "694965944590",
  appId: "1:694965944590:web:561de1786de9b787f5d75f"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- MEGA BASE DE DATOS LOCAL (Se combinará con la nube) ---
const DEFAULT_FOODS = [
  // --- FRUTAS (Por 100g) ---
  { id: 'f1', emoji: '🍎', name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: 'g' },
  { id: 'f2', emoji: '🍌', name: 'Cambur / Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: 'g' },
  { id: 'f3', emoji: '🍓', name: 'Fresas', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, unit: 'g' },
  { id: 'f4', emoji: '🍇', name: 'Uva', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, unit: 'g' },
  { id: 'f5', emoji: '🍊', name: 'Naranja', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, unit: 'g' },
  { id: 'f6', emoji: '🥭', name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, unit: 'g' },
  { id: 'f7', emoji: '🍍', name: 'Piña', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, unit: 'g' },
  { id: 'f8', emoji: '🍉', name: 'Sandía / Patilla', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, unit: 'g' },
  { id: 'f9', emoji: '🍈', name: 'Melón', calories: 34, protein: 0.8, carbs: 8, fat: 0.2, unit: 'g' },
  { id: 'f10', emoji: '🥑', name: 'Aguacate', calories: 160, protein: 2, carbs: 9, fat: 15, unit: 'g' },
  { id: 'f11', emoji: '🫐', name: 'Arándanos', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, unit: 'g' },
  { id: 'f12', emoji: '🍒', name: 'Cerezas', calories: 50, protein: 1, carbs: 12, fat: 0.3, unit: 'g' },
  { id: 'f13', emoji: '🥝', name: 'Kiwi', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, unit: 'g' },
  { id: 'f14', emoji: '🟠', name: 'Papaya / Lechosa', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, unit: 'g' },
  { id: 'f15', emoji: '🍑', name: 'Melocotón / Durazno', calories: 39, protein: 0.9, carbs: 10, fat: 0.3, unit: 'g' },
  { id: 'f16', emoji: '🍐', name: 'Pera', calories: 57, protein: 0.4, carbs: 15, fat: 0.1, unit: 'g' },
  { id: 'f17', emoji: '🍋', name: 'Limón', calories: 29, protein: 1.1, carbs: 9, fat: 0.3, unit: 'g' },
  { id: 'f18', emoji: '🍌', name: 'Plátano Macho (Crudo)', calories: 122, protein: 1.3, carbs: 32, fat: 0.4, unit: 'g' },
  { id: 'f19', emoji: '🟤', name: 'Dátiles', calories: 277, protein: 1.8, carbs: 75, fat: 0.2, unit: 'g' },
  { id: 'f20', emoji: '🍇', name: 'Pasas de Uva', calories: 299, protein: 3.1, carbs: 79, fat: 0.5, unit: 'g' },
  { id: 'f21', emoji: '🍈', name: 'Guayaba', calories: 68, protein: 2.6, carbs: 14, fat: 1, unit: 'g' },
  { id: 'f22', emoji: '🟡', name: 'Parchita / Maracuyá', calories: 97, protein: 2.2, carbs: 23, fat: 0.7, unit: 'g' },
  { id: 'f23', emoji: '🟢', name: 'Guanábana', calories: 66, protein: 1, carbs: 17, fat: 0.3, unit: 'g' },
  { id: 'f24', emoji: '🫐', name: 'Moras / Zarzamoras', calories: 43, protein: 1.4, carbs: 10, fat: 0.5, unit: 'g' },
  { id: 'f25', emoji: '🥥', name: 'Coco (Pulpa Fresca)', calories: 354, protein: 3.3, carbs: 15, fat: 33, unit: 'g' },

  // --- CARNES Y PROTEÍNAS (Por 100g) ---
  { id: 'c1', emoji: '🍗', name: 'Pechuga de Pollo', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: 'g' },
  { id: 'c2', emoji: '🥩', name: 'Carne de Res Magra', calories: 250, protein: 26, carbs: 0, fat: 15, unit: 'g' },
  { id: 'c3', emoji: '🐷', name: 'Cerdo Magro', calories: 242, protein: 27, carbs: 0, fat: 14, unit: 'g' },
  { id: 'c4', emoji: '🐟', name: 'Pescado Blanco', calories: 105, protein: 24, carbs: 0, fat: 1, unit: 'g' },
  { id: 'c5', emoji: '🐟', name: 'Atún enlatado (Agua)', calories: 116, protein: 26, carbs: 0, fat: 1, unit: 'g' },
  { id: 'c6', emoji: '🐟', name: 'Salmón', calories: 208, protein: 20, carbs: 0, fat: 13, unit: 'g' },
  { id: 'c7', emoji: '🍳', name: 'Huevo Entero', calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: 'g' },
  { id: 'c8', emoji: '🥓', name: 'Tocineta / Bacon', calories: 541, protein: 37, carbs: 1.4, fat: 42, unit: 'g' },
  { id: 'c9', emoji: '🍗', name: 'Muslo de Pollo (Sin Piel)', calories: 120, protein: 20, carbs: 0, fat: 4, unit: 'g' },
  { id: 'c10', emoji: '🍗', name: 'Pollo Frito (Empanizado)', calories: 270, protein: 15, carbs: 15, fat: 16, unit: 'g' },
  { id: 'c11', emoji: '🥩', name: 'Milanesa (Pollo/Res Empanizada)', calories: 260, protein: 18, carbs: 22, fat: 11, unit: 'g' },
  { id: 'c12', emoji: '🥩', name: 'Carne Molida (90% Magra)', calories: 176, protein: 20, carbs: 0, fat: 10, unit: 'g' },
  { id: 'c13', emoji: '🍖', name: 'Costillas de Cerdo', calories: 277, protein: 15, carbs: 0, fat: 23, unit: 'g' },
  { id: 'c14', emoji: '🥓', name: 'Chicharrón de Cerdo', calories: 544, protein: 61, carbs: 0, fat: 31, unit: 'g' },
  { id: 'c15', emoji: '🥘', name: 'Chinchurria / Chinchulines', calories: 240, protein: 14, carbs: 0, fat: 20, unit: 'g' },
  { id: 'c16', emoji: '🍖', name: 'Jamón York / Cocido', calories: 105, protein: 18, carbs: 1, fat: 3, unit: 'g' },
  { id: 'c17', emoji: '🥩', name: 'Jamón de Pavo', calories: 100, protein: 20, carbs: 1, fat: 2, unit: 'g' },
  { id: 'c18', emoji: '🥓', name: 'Jamón Serrano / Ibérico', calories: 250, protein: 30, carbs: 0, fat: 15, unit: 'g' },
  { id: 'c19', emoji: '🥩', name: 'Carne Mechada', calories: 250, protein: 25, carbs: 5, fat: 14, unit: 'g' },
  { id: 'c20', emoji: '🍲', name: 'Carne Sancochada', calories: 200, protein: 28, carbs: 0, fat: 9, unit: 'g' },
  
  // --- PESCADOS Y MARISCOS (Por 100g) ---
  { id: 'sea1', emoji: '🦐', name: 'Camarones / Langostinos', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, unit: 'g' },
  { id: 'sea2', emoji: '🦑', name: 'Calamar (Crudo)', calories: 92, protein: 16, carbs: 3, fat: 1.5, unit: 'g' },
  { id: 'sea3', emoji: '🐙', name: 'Pulpo', calories: 82, protein: 15, carbs: 2, fat: 1, unit: 'g' },
  { id: 'sea4', emoji: '🐟', name: 'Sardinas (Enlatadas / Escurridas)', calories: 208, protein: 25, carbs: 0, fat: 11, unit: 'g' },
  { id: 'sea5', emoji: '🐟', name: 'Merluza', calories: 90, protein: 19, carbs: 0, fat: 1.5, unit: 'g' },
  { id: 'sea6', emoji: '🐟', name: 'Tilapia', calories: 96, protein: 20, carbs: 0, fat: 1.7, unit: 'g' },
  { id: 'sea7', emoji: '🐟', name: 'Pargo / Huachinango', calories: 100, protein: 20.5, carbs: 0, fat: 1.3, unit: 'g' },
  { id: 'sea8', emoji: '🐟', name: 'Mero', calories: 92, protein: 19.4, carbs: 0, fat: 1, unit: 'g' },
  { id: 'sea9', emoji: '🐟', name: 'Corvina', calories: 104, protein: 17.8, carbs: 0, fat: 3.2, unit: 'g' },
  { id: 'sea10', emoji: '🐟', name: 'Dorado / Mahi-Mahi', calories: 85, protein: 18.5, carbs: 0, fat: 0.7, unit: 'g' },
  { id: 'sea11', emoji: '🦈', name: 'Cazón (Crudo)', calories: 130, protein: 21, carbs: 0, fat: 4.5, unit: 'g' },
  { id: 'sea12', emoji: '🐟', name: 'Atún Fresco', calories: 132, protein: 28, carbs: 0, fat: 1.8, unit: 'g' },
  { id: 'sea13', emoji: '🐟', name: 'Trucha', calories: 148, protein: 20.8, carbs: 0, fat: 6.6, unit: 'g' },
  { id: 'sea14', emoji: '🐟', name: 'Pez Espada', calories: 144, protein: 19.8, carbs: 0, fat: 6.7, unit: 'g' },
  { id: 'sea15', emoji: '🐟', name: 'Róbalo / Snook', calories: 97, protein: 18, carbs: 0, fat: 2, unit: 'g' },
  { id: 'sea16', emoji: '🦪', name: 'Mejillones', calories: 86, protein: 12, carbs: 4, fat: 2.2, unit: 'g' },
  { id: 'sea17', emoji: '🦞', name: 'Langosta', calories: 89, protein: 19, carbs: 0, fat: 0.9, unit: 'g' },
  { id: 'sea18', emoji: '🦀', name: 'Cangrejo / Jaiba', calories: 87, protein: 18, carbs: 0, fat: 1.5, unit: 'g' },
  { id: 'sea19', emoji: '🐟', name: 'Sardinas Frescas', calories: 208, protein: 24.6, carbs: 0, fat: 11.5, unit: 'g' },

  // --- PANES Y CARBOHIDRATOS (Por 100g) ---
  { id: 'p1', emoji: '🍞', name: 'Pan Blanco de Molde', calories: 265, protein: 9, carbs: 49, fat: 3.2, unit: 'g' },
  { id: 'p2', emoji: '🥪', name: 'Pan Integral de Molde', calories: 247, protein: 13, carbs: 41, fat: 4.2, unit: 'g' },
  { id: 'p3', emoji: '🍔', name: 'Pan de Hamburguesa', calories: 277, protein: 10, carbs: 50, fat: 4, unit: 'g' },
  { id: 'p4', emoji: '🫓', name: 'Arepa Asada', calories: 215, protein: 4, carbs: 46, fat: 2, unit: 'g' },
  { id: 'p5', emoji: '🍚', name: 'Arroz Blanco (Cocido)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: 'g' },
  { id: 'p6', emoji: '🍝', name: 'Pasta (Cocida)', calories: 158, protein: 6, carbs: 31, fat: 1, unit: 'g' },
  { id: 'p7', emoji: '🥔', name: 'Papa / Patata (Hervida)', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, unit: 'g' },
  { id: 'p8', emoji: '🍠', name: 'Batata / Camote', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: 'g' },
  { id: 'p9', emoji: '🥣', name: 'Avena', calories: 389, protein: 17, carbs: 66, fat: 7, unit: 'g' },
  { id: 'p10', emoji: '🥖', name: 'Baguette Tradicional', calories: 274, protein: 10, carbs: 52, fat: 1.5, unit: 'g' },
  { id: 'p11', emoji: '🍞', name: 'Pan de Masa Madre', calories: 289, protein: 12, carbs: 51, fat: 1.8, unit: 'g' },
  { id: 'p12', emoji: '🍞', name: 'Pan Ezequiel', calories: 260, protein: 14, carbs: 43, fat: 4.5, unit: 'g' },
  { id: 'p13', emoji: '🥯', name: 'Bagel Tradicional', calories: 275, protein: 11, carbs: 53, fat: 1.5, unit: 'g' },
  { id: 'p14', emoji: '🌮', name: 'Tortilla de Trigo', calories: 295, protein: 8, carbs: 49, fat: 7, unit: 'g' },
  { id: 'p15', emoji: '🌮', name: 'Tortilla de Maíz', calories: 218, protein: 6, carbs: 45, fat: 2.8, unit: 'g' },
  { id: 'p16', emoji: '🍘', name: 'Tortita de Arroz Inflado', calories: 387, protein: 8, carbs: 82, fat: 2.8, unit: 'g' },
  { id: 'p17', emoji: '🌮', name: 'Tortilla de Trigo Integral', calories: 270, protein: 9, carbs: 43, fat: 6, unit: 'g' },
  { id: 'p18', emoji: '🥞', name: 'Cachapa de Maíz', calories: 250, protein: 7, carbs: 45, fat: 5, unit: 'g' },
  { id: 'p19', emoji: '🥔', name: 'Puré de Papa', calories: 110, protein: 2, carbs: 17, fat: 4, unit: 'g' },
  { id: 'p20', emoji: '🍎', name: 'Puré de Manzana', calories: 52, protein: 0.2, carbs: 14, fat: 0.1, unit: 'g' },

  // --- LÁCTEOS Y DERIVADOS (Por 100g/ml) ---
  { id: 'l1', emoji: '🧀', name: 'Queso Blanco', calories: 299, protein: 22, carbs: 3, fat: 22, unit: 'g' },
  { id: 'l2', emoji: '🧀', name: 'Queso Amarillo / Cheddar', calories: 402, protein: 25, carbs: 1.3, fat: 33, unit: 'g' },
  { id: 'l3', emoji: '🥛', name: 'Leche Entera', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, unit: 'ml' },
  { id: 'l4', emoji: '🥛', name: 'Yogurt Griego (Entero)', calories: 97, protein: 9, carbs: 4, fat: 5, unit: 'g' },
  { id: 'l5', emoji: '🥛', name: 'Leche Desnatada', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, unit: 'ml' },
  { id: 'l6', emoji: '🥛', name: 'Leche Sin Lactosa', calories: 43, protein: 3.2, carbs: 4.8, fat: 1.5, unit: 'ml' },
  { id: 'l7', emoji: '🥛', name: 'Bebida de Almendras', calories: 13, protein: 0.4, carbs: 0.1, fat: 1.1, unit: 'ml' },
  { id: 'l8', emoji: '🥛', name: 'Bebida de Soja', calories: 33, protein: 3.3, carbs: 1.8, fat: 1.8, unit: 'ml' },
  { id: 'l9', emoji: '🥣', name: 'Yogurt Griego 0% Grasa', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: 'g' },
  { id: 'l10', emoji: '🥣', name: 'Queso Cottage 0%', calories: 72, protein: 12, carbs: 3, fat: 1, unit: 'g' },
  { id: 'l11', emoji: '🧀', name: 'Queso Mozzarella Light', calories: 165, protein: 20, carbs: 2, fat: 9, unit: 'g' },
  { id: 'l12', emoji: '🧀', name: 'Queso Parmesano', calories: 431, protein: 38, carbs: 3, fat: 29, unit: 'g' },
  { id: 'l13', emoji: '🧈', name: 'Mantequilla Tradicional', calories: 717, protein: 0.8, carbs: 0.1, fat: 81, unit: 'g' },
  
  // --- SNACKS Y OTROS (Por 100g) ---
  { id: 's1', emoji: '🍫', name: 'Chocolate Oscuro +85%', calories: 598, protein: 8, carbs: 46, fat: 43, unit: 'g' },
  { id: 's2', emoji: '🍪', name: 'Galleta de Chocolate (Oreo)', calories: 480, protein: 5, carbs: 68, fat: 20, unit: 'g' },
  { id: 's3', emoji: '🍟', name: 'Papas Fritas', calories: 312, protein: 3.4, carbs: 41, fat: 15, unit: 'g' },
  { id: 's4', emoji: '🥜', name: 'Maní / Cacahuate', calories: 567, protein: 26, carbs: 16, fat: 49, unit: 'g' },
  { id: 's5', emoji: '🥜', name: 'Almendras Naturales', calories: 579, protein: 21, carbs: 22, fat: 50, unit: 'g' },
  { id: 's6', emoji: '🧠', name: 'Nueces', calories: 654, protein: 15, carbs: 14, fat: 65, unit: 'g' },
  { id: 's7', emoji: '🍯', name: 'Crema de Cacahuete Natural', calories: 588, protein: 25, carbs: 20, fat: 50, unit: 'g' },
  { id: 's8', emoji: '🍫', name: 'Barrita de Proteína', calories: 350, protein: 30, carbs: 35, fat: 10, unit: 'g' },
  { id: 's9', emoji: '🍿', name: 'Palomitas Caseras (Sin aceite)', calories: 387, protein: 13, carbs: 78, fat: 5, unit: 'g' },
  { id: 's10', emoji: '🥩', name: 'Beef Jerky / Carne Seca', calories: 410, protein: 33, carbs: 11, fat: 26, unit: 'g' },
  { id: 's11', emoji: '🫘', name: 'Garbanzos Tostados', calories: 364, protein: 19, carbs: 60, fat: 6, unit: 'g' },
  { id: 's12', emoji: '🍬', name: 'Gominolas / Gomitas', calories: 348, protein: 5, carbs: 80, fat: 0, unit: 'g' },
  { id: 's13', emoji: '🍪', name: 'Galletas María', calories: 432, protein: 7, carbs: 75, fat: 11, unit: 'g' },
  { id: 's14', emoji: '🍘', name: 'Crackers / Galletas Saladas', calories: 504, protein: 7, carbs: 60, fat: 26, unit: 'g' },

  // --- BEBIDAS Y JUGOS (Por 100ml) ---
  { id: 'b1', emoji: '☕', name: 'Café Negro', calories: 2, protein: 0.2, carbs: 0, fat: 0, unit: 'ml' },
  { id: 'b2', emoji: '☕', name: 'Café con Leche', calories: 42, protein: 2, carbs: 4, fat: 2, unit: 'ml' },
  { id: 'b3', emoji: '🧃', name: 'Jugo de Naranja', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, unit: 'ml' },
  { id: 'b4', emoji: '🧃', name: 'Jugo de Manzana', calories: 46, protein: 0.1, carbs: 11, fat: 0.1, unit: 'ml' },
  { id: 'b5', emoji: '🍋', name: 'Limonada', calories: 40, protein: 0, carbs: 10, fat: 0, unit: 'ml' },
  { id: 'b6', emoji: '🥤', name: 'Refresco Regular', calories: 42, protein: 0, carbs: 11, fat: 0, unit: 'ml' },
  { id: 'b7', emoji: '🥤', name: 'Refresco Zero / Light', calories: 0, protein: 0, carbs: 0, fat: 0, unit: 'ml' },
];

const MEAL_TYPES = {
  breakfast: { label: 'Desayuno', icon: <Coffee size={24} />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  lunch: { label: 'Almuerzo', icon: <Sun size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  dinner: { label: 'Cena', icon: <Moon size={24} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  snack: { label: 'Meriendas', icon: <Cookie size={24} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

// --- UTILIDADES ---
const normalizeText = (text) => text?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";
const triggerHaptic = () => { if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); };
const getTodayString = () => new Date().toISOString().split('T')[0];

const Card = ({ children, className = "", onClick }) => (
  <div onClick={(e) => { if(onClick){ triggerHaptic(); onClick(e); } }} className={`bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-white rounded-[2rem] transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const PremiumOption = ({ active, onClick, emoji, title, desc, col = false }) => (
  <button onClick={(e) => { triggerHaptic(); onClick(e); }} className={`relative overflow-hidden w-full p-5 rounded-3xl transition-all duration-500 ease-out text-left flex ${col ? 'flex-col items-center text-center gap-3' : 'items-center gap-4'} group ${active ? 'bg-gradient-to-br from-emerald-900/40 to-zinc-900 border border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50 scale-[1.03] z-10' : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1'}`}>
    {active && <div className="absolute -left-6 -top-6 w-24 h-24 bg-emerald-500/30 rounded-full blur-2xl pointer-events-none"></div>}
    <div className={`text-4xl transition-transform duration-500 relative z-10 ${active ? 'scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>{emoji}</div>
    <div className={`flex-1 relative z-10 ${col ? 'w-full' : ''}`}>
      <h3 className={`font-black text-lg mb-0.5 tracking-tight transition-colors duration-300 ${active ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-zinc-200'}`}>{title}</h3>
      {desc && <p className={`text-xs font-medium leading-relaxed transition-colors duration-300 ${active ? 'text-emerald-100/70' : 'text-zinc-500 group-hover:text-zinc-400'}`}>{desc}</p>}
    </div>
    {active && !col && <div className="absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.6)]"><Check size={16} className="text-zinc-950 stroke-[3]"/></div>}
  </button>
);

const MacroBar = ({ label, current, max, colorClass }) => {
  const percentage = Math.min(100, (current / max) * 100) || 0;
  return (
    <div className="w-full mb-3">
      <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-widest text-zinc-400">
        <span>{label}</span><span className="text-white">{Math.round(current)} / {Math.round(max)}g</span>
      </div>
      <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/50">
        <div className={`h-full ${colorClass} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

// --- ASISTENTE DE PERFIL (Solo sale si es nuevo usuario) ---
const ProfileWizard = ({ onComplete, initialName }) => {
  const [step, setStep] = useState(2); // Saltamos el nombre porque viene del login
  const [data, setData] = useState({ name: initialName, gender: 'male', age: '', weight: '', height: '', jobType: 'sedentary', workoutLevel: 'none', goal: 'lose' });
  const [error, setError] = useState('');

  const calculateResults = () => {
    const w = parseFloat(data.weight) || 0, h = parseFloat(data.height) || 0, a = parseFloat(data.age) || 0;
    let bmr = (10 * w) + (6.25 * h) - (5 * a) + (data.gender === 'male' ? 5 : -161);
    const jobMult = { sedentary: 1.2, active: 1.45, physical: 1.7 }[data.jobType] || 1.2;
    const sportMult = { none: 0, light: 0.1, moderate: 0.2, intense: 0.35 }[data.workoutLevel] || 0;
    const tdee = Math.round(bmr * (jobMult + sportMult));
    let target = tdee;
    if (data.goal === 'lose') target = tdee - 500; 
    if (data.goal === 'gain') target = tdee + 300; 
    if (data.goal === 'lose' && target < (data.gender === 'male' ? 1500 : 1200)) target = (data.gender === 'male' ? 1500 : 1200);
    return { bmr: Math.round(bmr), tdee, target };
  };

  const validateMeasurements = () => {
      const a = parseFloat(data.age);
      const w = parseFloat(data.weight);
      const h = parseFloat(data.height);
      if (!a || a < 12 || a > 100) return "Ingresa una edad real (12 a 100 años).";
      if (!w || w < 30 || w > 300) return "Ingresa un peso real (30 a 300 kg).";
      if (!h || h < 100 || h > 250) return "Ingresa una altura real (100 a 250 cm).";
      return null;
  };

  const next = () => {
      triggerHaptic();
      if (step === 3) {
          if (!data.age || !data.weight || !data.height) { 
              setError("Completa todos los campos primero."); 
              return; 
          }
          const err = validateMeasurements();
          if (err) {
              setError(err);
              return;
          }
      }
      setError(''); setStep(s => s + 1);
  };
  const back = () => { triggerHaptic(); setStep(s => s - 1); };

  if (step === 7) {
    const r = calculateResults();
    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-md mx-auto w-full animate-fade-in-up">
                <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/50 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <Target size={40} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>
                <h2 className="text-3xl font-black mb-2 text-center tracking-tight">Tu Objetivo Generado</h2>
                <div className="w-full relative p-8 rounded-[3rem] bg-zinc-900/50 border border-zinc-800/80 text-center overflow-hidden backdrop-blur-xl mb-8 group hover:border-emerald-500/50 transition-colors duration-500">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]"></div>
                    <p className="text-emerald-400 font-bold tracking-widest text-[10px] uppercase mb-2">Meta Calórica</p>
                    <div className="text-8xl font-black text-white tracking-tighter mb-1 drop-shadow-md">{r.target}</div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-8">Kcal / Día</p>
                    <div className="grid grid-cols-3 gap-3 relative z-10">
                        <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800/80 shadow-inner">
                            <div className="text-emerald-400 font-black text-xl mb-1">{Math.round((r.target * 0.3) / 4)}g</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Prot</div>
                        </div>
                        <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800/80 shadow-inner">
                            <div className="text-blue-400 font-black text-xl mb-1">{Math.round((r.target * 0.4) / 4)}g</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Carb</div>
                        </div>
                        <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800/80 shadow-inner">
                            <div className="text-orange-400 font-black text-xl mb-1">{Math.round((r.target * 0.3) / 9)}g</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Gras</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 relative z-10 max-w-md mx-auto w-full pb-10">
                <button onClick={() => onComplete(r.target, data)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 h-16 rounded-full font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02]">
                    Guardar Perfil y Comenzar
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden">
        <style>{`
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-emerald-500/10 rounded-[100%] blur-[100px] pointer-events-none"></div>
        <div className="flex-1 flex flex-col relative z-10 max-w-md mx-auto w-full">
            <div className="px-6 pt-12 pb-4">
                <div className="flex gap-1.5 mb-8">
                    {[2,3,4,5,6].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`}></div>)}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide flex flex-col justify-center">
                <div key={step} className="animate-fade-in-up">
                    {step === 2 && (
                        <div className="pt-4 space-y-6">
                            <div><h2 className="text-3xl font-black mb-2 tracking-tight">Tu Biología</h2><p className="text-zinc-400 text-sm">Hola {data.name}, necesitamos esto para tus fórmulas.</p></div>
                            <div className="grid grid-cols-2 gap-4">
                                <PremiumOption col active={data.gender === 'male'} onClick={()=>setData({...data, gender:'male'})} emoji="👨" title="Hombre" />
                                <PremiumOption col active={data.gender === 'female'} onClick={()=>setData({...data, gender:'female'})} emoji="👩" title="Mujer" />
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="pt-4 space-y-6">
                            <div><h2 className="text-3xl font-black mb-2 tracking-tight">Tus Medidas</h2><p className="text-zinc-400 text-sm">Sé preciso para calcular tu gasto calórico.</p></div>
                            {error && <div className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-xl">{error}</div>}
                            <div className="space-y-4">
                                {[{ label: 'Edad', key: 'age', unit: 'Años' }, { label: 'Peso', key: 'weight', unit: 'Kg' }, { label: 'Altura', key: 'height', unit: 'Cm' }].map(f => (
                                    <label key={f.key} className="block bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 focus-within:border-emerald-500 focus-within:bg-emerald-900/10 transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm">{f.label}</span>
                                            <div className="flex items-end gap-2">
                                                <input type="number" value={data[f.key]} onChange={e => setData({...data, [f.key]: e.target.value.replace(/[^0-9]/g, '')})} className="w-32 bg-transparent text-right text-4xl font-black outline-none text-white focus:text-emerald-400" placeholder="0" />
                                                <span className="text-zinc-600 font-bold text-lg pb-1">{f.unit}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="pt-4 space-y-6">
                            <div><h2 className="text-3xl font-black mb-2">Actividad Laboral</h2><p className="text-zinc-400 text-sm">¿Cómo es tu día a día fuera del ejercicio?</p></div>
                            <div className="space-y-3">
                                <PremiumOption active={data.jobType === 'sedentary'} onClick={()=>setData({...data, jobType:'sedentary'})} emoji="💻" title="Sedentario" desc="Trabajo de escritorio." />
                                <PremiumOption active={data.jobType === 'active'} onClick={()=>setData({...data, jobType:'active'})} emoji="🚶" title="De Pie / Activo" desc="Trabajo en movimiento." />
                                <PremiumOption active={data.jobType === 'physical'} onClick={()=>setData({...data, jobType:'physical'})} emoji="🏗️" title="Físico / Pesado" desc="Carga pesada, construcción." />
                            </div>
                        </div>
                    )}
                    {step === 5 && (
                        <div className="pt-4 space-y-6">
                            <div><h2 className="text-3xl font-black mb-2">Entrenamiento</h2><p className="text-zinc-400 text-sm">Horas dedicadas al deporte.</p></div>
                            <div className="space-y-3">
                                <PremiumOption active={data.workoutLevel === 'none'} onClick={()=>setData({...data, workoutLevel:'none'})} emoji="🛋️" title="Ninguno" desc="0 hrs/sem." />
                                <PremiumOption active={data.workoutLevel === 'light'} onClick={()=>setData({...data, workoutLevel:'light'})} emoji="🧘" title="Ligero" desc="1-3 hrs/sem." />
                                <PremiumOption active={data.workoutLevel === 'moderate'} onClick={()=>setData({...data, workoutLevel:'moderate'})} emoji="💪" title="Moderado" desc="3-5 hrs/sem." />
                                <PremiumOption active={data.workoutLevel === 'intense'} onClick={()=>setData({...data, workoutLevel:'intense'})} emoji="🔥" title="Atleta" desc="+6 hrs/sem." />
                            </div>
                        </div>
                    )}
                    {step === 6 && (
                        <div className="pt-4 space-y-6">
                            <div><h2 className="text-3xl font-black mb-2">Tu Objetivo</h2><p className="text-zinc-400 text-sm">Calcularemos tus macros con base a esto.</p></div>
                            <div className="space-y-3">
                                <PremiumOption active={data.goal === 'lose'} onClick={()=>setData({...data, goal:'lose'})} emoji="📉" title="Perder Grasa" desc="Déficit calórico." />
                                <PremiumOption active={data.goal === 'maintain'} onClick={()=>setData({...data, goal:'maintain'})} emoji="⚖️" title="Mantenimiento" desc="Equilibrio de peso." />
                                <PremiumOption active={data.goal === 'gain'} onClick={()=>setData({...data, goal:'gain'})} emoji="📈" title="Ganar Músculo" desc="Superávit calórico." />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-6 bg-gradient-to-t from-black via-black to-transparent fixed bottom-0 left-0 w-full z-20">
                <div className="max-w-md mx-auto flex gap-3">
                    {step > 2 && <button onClick={back} className="w-16 h-16 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400"><ArrowLeft size={24}/></button>}
                    <button onClick={next} className="flex-1 h-16 bg-emerald-500 text-zinc-950 rounded-full font-black text-lg flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)]">{step === 6 ? 'Finalizar' : 'Siguiente'}</button>
                </div>
            </div>
        </div>
    </div>
  );
};


// --- APP PRINCIPAL ---
export default function App() {
  // Estado de Firebase Auth
  const [fbUser, setFbUser] = useState(null);
  
  // Estado de nuestra Pseudo-Auth
  const [authUser, setAuthUser] = useState(null); // { username, password }
  const [profile, setProfile] = useState(null); // Datos metabólicos
  
  // Estados de Datos
  const [allFoodsDB, setAllFoodsDB] = useState(DEFAULT_FOODS);
  const [dailyLogs, setDailyLogs] = useState([]);
  
  // Vistas y navegación
  const [view, setView] = useState('auth'); // auth, dashboard, meal-detail, add-food, scanner
  const [activeMeal, setActiveMeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDbFood, setSelectedDbFood] = useState(null);
  const [gramsInput, setGramsInput] = useState('');

  // Escáner IA
  const [isScanning, setIsScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);

  // Variables para Login Simple
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- VARIABLES DE ADMINISTRADOR ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('users'); // 'users' o 'catalog'
  const [adminUsers, setAdminUsers] = useState([]);
  const [bulkText, setBulkText] = useState('');
  const [singleFood, setSingleFood] = useState({ id: '', emoji: '', name: '', calories: '', protein: '', carbs: '', fat: '', unit: 'g' });
  const [userToDelete, setUserToDelete] = useState(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');

  // --- FIREBASE INIT ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch(e) { console.error("Error Auth:", e); }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, user => setFbUser(user));
    return () => unsub();
  }, []);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    if (!fbUser) return;
    
    // Función Mágica: Si la nube está vacía, sube todos los alimentos locales de un solo golpe
    const syncFoodsToCloud = async () => {
        const foodsRef = collection(db, 'global_foods');
        const snap = await getDocs(query(foodsRef, limit(1)));
        
        if (snap.empty) {
            console.log("Subiendo catálogo de alimentos a Firebase...");
            const batch = writeBatch(db);
            DEFAULT_FOODS.forEach(food => {
                batch.set(doc(foodsRef, food.id), food);
            });
            await batch.commit();
            console.log("¡Catálogo sincronizado en la nube!");
        }
    };
    syncFoodsToCloud();

    // Escuchar la base de datos global de alimentos (ahora oficial en tu Firebase)
    const unsubFoods = onSnapshot(collection(db, 'global_foods'), (snapshot) => {
        const remoteFoods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Si la nube ya tiene datos, la usamos como fuente principal
        if (remoteFoods.length > 0) {
            setAllFoodsDB(remoteFoods);
        } else {
            setAllFoodsDB(DEFAULT_FOODS);
        }
    }, (err) => console.error("Foods error:", err));

    let unsubLogs = () => {};
    
    if (authUser) {
        // Escuchar SOLO los registros del usuario logueado en su propia carpeta personal
        unsubLogs = onSnapshot(collection(db, 'users', authUser.username, 'logs'), (snapshot) => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDailyLogs(logs);
        }, (err) => console.error("Logs error:", err));
    }

    return () => { unsubFoods(); unsubLogs(); };
  }, [fbUser, authUser]);

  // --- LÓGICA PSEUDO-LOGIN ---
  const handlePseudoLogin = async () => {
      triggerHaptic();
      setLoginError('');
      if (!loginUser.trim() || !loginPass.trim()) { setLoginError('Completa ambos campos'); return; }
      
      const userId = normalizeText(loginUser);
      try {
          const docRef = doc(db, 'users', userId);
          const snap = await getDoc(docRef);
          
          // --- ACCESO SECRETO DE ADMINISTRADOR ---
          if (userId === 'admin') {
              if (snap.exists() && snap.data().password !== loginPass) {
                  setLoginError('Clave de Admin incorrecta'); return;
              }
              if (!snap.exists()) {
                  // Crea el admin la primera vez que entras con usuario "admin"
                  await setDoc(docRef, { password: loginPass, profile: { name: 'Admin Central', target: 0, goal: 'admin' } });
              }
              setAuthUser({ username: userId, password: loginPass });
              setProfile({ name: 'Administrador', goal: 'admin' });
              setIsAdmin(true);
              setView('admin'); // Manda directo al panel
              
              // Cargar todos los usuarios para el panel
              const usersSnap = await getDocs(collection(db, 'users'));
              setAdminUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
              return;
          }

          // --- ACCESO DE USUARIO NORMAL ---
          if (snap.exists()) {
              const data = snap.data();
              if (data.password !== loginPass) {
                  setLoginError('Contraseña incorrecta');
              } else {
                  setAuthUser({ username: userId, password: loginPass });
                  setProfile(data.profile);
                  setView('dashboard');
              }
          } else {
              // Si no existe, preparamos para crearlo y mandamos al Wizard
              setAuthUser({ username: userId, password: loginPass });
              setProfile(null);
              setView('wizard');
          }
      } catch(e) {
          console.error(e); setLoginError("Error conectando a la base de datos");
      }
  };

  const handleProfileComplete = async (target, extraData) => {
      const fullProfile = { ...extraData, target };
      try {
          // Guardar permanentemente en Firestore (Tu base de datos real)
          await setDoc(doc(db, 'users', authUser.username), {
              password: authUser.password,
              profile: fullProfile,
              createdAt: new Date().toISOString()
          });
          setProfile(fullProfile);
          setView('dashboard');
      } catch (e) {
          console.error("Error guardando perfil:", e);
      }
  };

  const handleLogout = () => {
      triggerHaptic();
      setAuthUser(null);
      setProfile(null);
      setLoginUser('');
      setLoginPass('');
      setIsAdmin(false); // Resetear admin
      setView('auth');
  };

  // Filtrar logs del usuario actual para HOY
  const todayString = getTodayString();
  const myTodayFoods = useMemo(() => {
      if (!authUser) return [];
      return dailyLogs.filter(log => log.date === todayString);
  }, [dailyLogs, authUser, todayString]);

  // Cálculos reactivos de macros
  const totals = useMemo(() => myTodayFoods.reduce((acc, item) => ({
      cal: acc.cal + (item.calories || 0), p: acc.p + (item.protein || 0), c: acc.c + (item.carbs || 0), f: acc.f + (item.fat || 0),
  }), { cal: 0, p: 0, c: 0, f: 0 }), [myTodayFoods]);

  const dailyGoal = profile?.target || 2000;
  const macroGoals = useMemo(() => ({
      p: Math.round((dailyGoal * 0.30) / 4), c: Math.round((dailyGoal * 0.40) / 4), f: Math.round((dailyGoal * 0.30) / 9), 
  }), [dailyGoal]);

  // Agregar alimento a la base de datos de registro diario (Nube)
  const handleAddFoodToLog = async (foodObj) => {
      triggerHaptic();
      try {
          await addDoc(collection(db, 'users', authUser.username, 'logs'), {
              ...foodObj,
              date: todayString,
              timestamp: Date.now()
          });
          setSearchTerm(''); setSelectedDbFood(null); setGramsInput('');
          setView('meal-detail');
      } catch(e) { console.error("Error guardando comida:", e); }
  };

  const handleAddManualFood = () => {
      const val = parseFloat(gramsInput); 
      if (!val || val <= 0) return;
      const factor = selectedDbFood.unit === 'g' || selectedDbFood.unit === 'ml' ? val / 100 : val;
      handleAddFoodToLog({
          name: selectedDbFood.name, emoji: selectedDbFood.emoji, meal: activeMeal,
          calories: Math.round(selectedDbFood.calories * factor),
          protein: parseFloat((selectedDbFood.protein * factor).toFixed(1)),
          carbs: parseFloat((selectedDbFood.carbs * factor).toFixed(1)),
          fat: parseFloat((selectedDbFood.fat * factor).toFixed(1)),
          grams: val, unit: selectedDbFood.unit
      });
  };

  const handleDeleteFoodLog = async (id) => {
      triggerHaptic();
      try { await deleteDoc(doc(db, 'users', authUser.username, 'logs', id)); } 
      catch(e) { console.error("Error borrando:", e); }
  };

  // --- ESCÁNER IA ---
  const handleImageUpload = (e) => {
      triggerHaptic();
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result;
          setImagePreview(base64String);
          analyzeFoodImage(base64String, file.type);
      };
      reader.readAsDataURL(file);
  };

  const analyzeFoodImage = async (base64Data, mimeType) => {
      setIsScanning(true);
      try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (!apiKey) throw new Error("API Key no configurada. Revisa las variables de entorno.");
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          const base64Clean = base64Data.split(',')[1];
          const payload = {
              contents: [{ role: "user", parts: [
                      { text: "Eres experto nutricionista. Analiza la imagen de la comida e identifica todos los alimentos. Estima la porción en gramos. Responde ÚNICAMENTE con un JSON array (sin texto adicional, sin markdown) de objetos con estos campos: name (string), emoji (string), amount (number en gramos), unit (string, 'g' o 'ud'), calories (number), protein (number), carbs (number), fat (number). Ejemplo: [{\"name\":\"Arroz\",\"emoji\":\"🍚\",\"amount\":150,\"unit\":\"g\",\"calories\":195,\"protein\":4,\"carbs\":43,\"fat\":0.3}]" },
                      { inlineData: { mimeType: mimeType, data: base64Clean } }
              ]}],
              generationConfig: { temperature: 0.1 }
          };
          const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          const data = await response.json();
          if (!response.ok) throw new Error(`API Error ${response.status}: ${data?.error?.message || 'Error desconocido'}`);
          let textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          // Limpiar markdown si Gemini lo devuelve con ```json ... ```
          textResult = textResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          if (!textResult) throw new Error("La IA no devolvió resultados.");
          const parsed = JSON.parse(textResult);
          setScannedItems(parsed.map(item => ({ ...item, id: 'ai_'+Math.random(), originalAmount: item.amount, originalCalories: item.calories, originalProtein: item.protein, originalCarbs: item.carbs, originalFat: item.fat })));
      } catch (e) {
          console.error("Error IA completo:", e);
          alert(`Error IA: ${e.message}`);
          setImagePreview(null);
      } finally { setIsScanning(false); }
  };

  const calcMacroAI = (item, macro) => Math.round(item[`original${macro.charAt(0).toUpperCase() + macro.slice(1)}`] * (parseFloat(item.amount) / item.originalAmount || 0));

  const handleAcceptScannedItems = () => {
      scannedItems.forEach(item => {
          handleAddFoodToLog({
              name: item.name + ' ✨', emoji: item.emoji, meal: activeMeal,
              calories: calcMacroAI(item, 'calories'), protein: calcMacroAI(item, 'protein'), carbs: calcMacroAI(item, 'carbs'), fat: calcMacroAI(item, 'fat'),
              grams: item.amount, unit: item.unit
          });
      });
      setScannedItems([]); setImagePreview(null);
  };

  const searchResults = useMemo(() => {
      if (!searchTerm) return allFoodsDB.slice(0, 15); // Muestra sugerencias
      const term = normalizeText(searchTerm);
      return allFoodsDB.filter(i => normalizeText(i.name).includes(term));
  }, [searchTerm, allFoodsDB]);

  // --- FUNCIONES DE ADMINISTRADOR ---
  const handleBulkUpload = async () => {
      triggerHaptic();
      if (!bulkText.trim()) return;
      const lines = bulkText.split('\n').filter(l => l.trim());
      const batch = writeBatch(db);
      let count = 0;
      lines.forEach(line => {
          const parts = line.split(';').map(p => p.trim());
          if (parts.length >= 8) {
              const [id, emoji, name, cal, prot, carb, fat, unit] = parts;
              if (id && name) {
                  batch.set(doc(db, 'global_foods', id), {
                      id, emoji: emoji || '🍽️', name,
                      calories: parseFloat(cal) || 0, protein: parseFloat(prot) || 0,
                      carbs: parseFloat(carb) || 0, fat: parseFloat(fat) || 0,
                      unit: unit || 'g'
                  });
                  count++;
              }
          }
      });
      if (count > 0) {
          await batch.commit();
          alert(`¡${count} alimentos inyectados a la nube!`);
          setBulkText('');
      } else {
          alert("No se encontraron líneas válidas. Revisa el formato.");
      }
  };

  const handleSingleUpload = async () => {
      triggerHaptic();
      if (!singleFood.name.trim()) return;
      const foodId = singleFood.id || `custom_${Date.now()}`;
      const foodData = {
          id: foodId,
          emoji: singleFood.emoji || '🍽️',
          name: singleFood.name,
          calories: parseFloat(singleFood.calories) || 0,
          protein: parseFloat(singleFood.protein) || 0,
          carbs: parseFloat(singleFood.carbs) || 0,
          fat: parseFloat(singleFood.fat) || 0,
          unit: singleFood.unit || 'g'
      };
      await setDoc(doc(db, 'global_foods', foodId), foodData);
      alert(`"${singleFood.name}" ${singleFood.id ? 'actualizado' : 'añadido'} en la nube.`);
      setSingleFood({ id: '', emoji: '', name: '', calories: '', protein: '', carbs: '', fat: '', unit: 'g' });
  };

  const handleDeleteUser = async () => {
      if (!userToDelete) return;
      triggerHaptic();
      try {
          // Borrar todos los logs del usuario
          const logsSnap = await getDocs(collection(db, 'users', userToDelete, 'logs'));
          const batch = writeBatch(db);
          logsSnap.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
          // Borrar el documento del usuario
          await deleteDoc(doc(db, 'users', userToDelete));
          setAdminUsers(adminUsers.filter(u => u.id !== userToDelete));
          setUserToDelete(null);
      } catch(e) { console.error("Error eliminando usuario:", e); }
  };

  const handleExportTXT = () => {
      triggerHaptic();
      const lines = allFoodsDB.map(f => `${f.id}; ${f.emoji}; ${f.name}; ${f.calories}; ${f.protein}; ${f.carbs}; ${f.fat}; ${f.unit}`);
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `MiDeficit_Catalogo_${getTodayString()}.txt`;
      a.click(); URL.revokeObjectURL(url);
  };

  // --- PANTALLA DE LOGIN ---
  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden">
          <style>{`
              @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
              .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          `}</style>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 bg-emerald-500/10 rounded-[100%] blur-[100px] pointer-events-none"></div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 max-w-md mx-auto w-full animate-fade-in-up">
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                  <Flame size={48} className="text-emerald-400 drop-shadow-[0_0_12px_rgba(0,242,254,0.4)] relative z-10" fill="currentColor" />
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-1">MiDéficit</h1>
              <p className="text-zinc-500 text-sm mb-10 font-medium">Tu sistema de control metabólico</p>
              
              <div className="w-full space-y-3 mb-6">
                  <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20}/>
                      <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Tu Nombre de Usuario" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-5 text-white font-bold outline-none focus:border-emerald-500 transition-colors placeholder-zinc-700" />
                  </div>
                  <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20}/>
                      <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Contraseña" onKeyDown={e => e.key === 'Enter' && handlePseudoLogin()} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-14 pr-5 text-white font-bold outline-none focus:border-emerald-500 transition-colors placeholder-zinc-700" />
                  </div>
              </div>
              
              {loginError && <p className="text-red-400 text-sm font-bold mb-4 bg-red-500/10 w-full text-center p-3 rounded-xl">{loginError}</p>}
              
              <button onClick={handlePseudoLogin} className="w-full bg-emerald-500 text-zinc-950 p-4 rounded-2xl font-black text-lg shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform">
                  Ingresar
              </button>
              <p className="text-zinc-600 text-xs mt-6 text-center font-medium">Si no tienes cuenta, se creará una al ingresar.</p>
          </div>
      </div>
    );
  }

  // --- ASISTENTE DE PERFIL ---
  if (view === 'wizard') {
      return <ProfileWizard onComplete={handleProfileComplete} initialName={authUser?.username || 'Usuario'} />;
  }

  // --- INTERFAZ PRINCIPAL (Admin / Dashboard / Comidas) ---
  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
      <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Modal de Confirmación para Eliminar Usuario */}
      {userToDelete && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
              <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 max-w-sm w-full text-center space-y-5 shadow-2xl animate-fade-in-up">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={32} className="text-red-500"/></div>
                  <h3 className="font-black text-2xl">¿Estás seguro?</h3>
                  <p className="text-zinc-400 text-sm">Se eliminará al usuario <strong className="text-white">@{userToDelete}</strong> y todos sus registros.</p>
                  <div className="flex gap-3 pt-2">
                      <button onClick={() => { triggerHaptic(); setUserToDelete(null); }} className="flex-1 p-4 rounded-xl font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">Cancelar</button>
                      <button onClick={handleDeleteUser} className="flex-1 p-4 rounded-xl font-black bg-red-500 text-black shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-[1.02] transition-transform">Eliminar</button>
                  </div>
              </div>
          </div>
      )}

      {/* Header Fijo */}
      <div className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-2xl border-b border-zinc-900 bg-black/80">
         <h1 className="font-black text-xl flex items-center gap-2 tracking-tight">
             <Flame className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" fill="currentColor" /> MiDéficit
         </h1>
         <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-zinc-400 capitalize">{authUser?.username}</span>
             <button onClick={handleLogout} className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                <LogIn size={14} className="rotate-180"/>
             </button>
         </div>
      </div>

      <main className="pt-24 pb-10 px-6 max-w-3xl mx-auto min-h-screen">
        
        {/* --- PANEL DE ADMINISTRADOR --- */}
        {view === 'admin' && isAdmin && (
          <div className="animate-fade-in">
             <div className="mb-8">
                 <h2 className="text-3xl font-black text-emerald-400 tracking-tight flex items-center gap-3"><Zap/> Panel Central</h2>
                 <p className="text-zinc-400 text-sm mt-1">Control absoluto de la base de datos</p>
             </div>
             
             {/* Pestañas de Admin */}
             <div className="flex gap-2 mb-8 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
                 <button onClick={() => setAdminTab('users')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${adminTab === 'users' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'}`}>Usuarios Registrados</button>
                 <button onClick={() => setAdminTab('catalog')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${adminTab === 'catalog' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'}`}>Carga de Alimentos</button>
             </div>

             {adminTab === 'users' && (
                 <div className="space-y-4">
                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Comunidad ({adminUsers.length})</p>
                     {adminUsers.map(u => (
                         <div key={u.id} className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex justify-between items-center hover:border-emerald-500/50 transition-colors group">
                             <div>
                                 <p className="font-black text-xl text-white mb-1">@{u.id}</p>
                                 <p className="text-xs text-zinc-500 font-mono bg-zinc-950 px-2 py-1 rounded inline-block">Clave: {u.password}</p>
                             </div>
                             <div className="flex items-center gap-4">
                                 {u.profile && (
                                     <div className="text-right">
                                         <p className="font-bold text-emerald-400 text-lg">{u.profile.target} <span className="text-[10px] text-zinc-500">KCAL</span></p>
                                         <p className="text-xs uppercase font-bold text-zinc-400 mt-1">{u.profile.goal}</p>
                                     </div>
                                 )}
                                 {/* Botón de eliminar (oculto para el admin) */}
                                 {u.id !== 'admin' && (
                                     <button onClick={() => { triggerHaptic(); setUserToDelete(u.id); }} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-black transition-colors md:opacity-50 group-hover:opacity-100" title="Eliminar Usuario">
                                         <Trash2 size={20}/>
                                     </button>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             )}

             {adminTab === 'catalog' && (
                 <div className="space-y-8">
                     {/* Carga Masiva */}
                     <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800">
                         <h3 className="font-black text-xl mb-2 flex items-center gap-2"><Database size={20}/> Inyección Masiva (IA)</h3>
                         <p className="text-xs text-zinc-400 mb-4 leading-relaxed">Pídele a Gemini una lista con este formato estricto y pégala abajo:<br/><span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded mt-2 inline-block">ID_UNICO; EMOJI; NOMBRE; CALORÍAS; PROT; CARB; GRASA; UNIDAD</span></p>
                         <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder='Ej: p_15; 🌭; Perro Caliente; 300; 10; 26; 15; ud' className="w-full h-32 bg-black border border-zinc-700 rounded-2xl p-4 text-sm font-mono text-emerald-300 outline-none focus:border-emerald-500 whitespace-pre scrollbar-hide mb-4"></textarea>
                         <button onClick={handleBulkUpload} className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-transform">Inyectar a la Nube</button>
                     </div>

                     {/* Carga Individual y Edición */}
                     <div id="admin-single-form" className={`bg-zinc-900 p-6 rounded-[2.5rem] border transition-colors ${singleFood.id ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-zinc-800'}`}>
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-black text-xl">{singleFood.id ? 'Editando Alimento' : 'Añadir Individual'}</h3>
                             {singleFood.id && <button onClick={() => setSingleFood({id:'', emoji:'', name:'', calories:'', protein:'', carbs:'', fat:'', unit:'g'})} className="text-xs font-bold text-zinc-500 hover:text-red-400 bg-black px-3 py-1.5 rounded-full transition-colors">Cancelar Edición</button>}
                         </div>
                         <div className="grid grid-cols-4 gap-2 mb-3">
                             <input type="text" placeholder="🥑" value={singleFood.emoji} onChange={e=>setSingleFood({...singleFood, emoji:e.target.value})} className="col-span-1 bg-black border border-zinc-700 rounded-xl p-3 text-center text-xl outline-none focus:border-emerald-500"/>
                             <input type="text" placeholder="Nombre" value={singleFood.name} onChange={e=>setSingleFood({...singleFood, name:e.target.value})} className="col-span-3 bg-black border border-zinc-700 rounded-xl p-3 font-bold outline-none focus:border-emerald-500 text-white"/>
                         </div>
                         <div className="grid grid-cols-3 gap-2 mb-3">
                             <input type="number" placeholder="Prot(g)" value={singleFood.protein} onChange={e=>setSingleFood({...singleFood, protein:e.target.value})} className="bg-black border border-zinc-700 rounded-xl p-3 text-center text-emerald-400 font-bold outline-none focus:border-emerald-500"/>
                             <input type="number" placeholder="Carb(g)" value={singleFood.carbs} onChange={e=>setSingleFood({...singleFood, carbs:e.target.value})} className="bg-black border border-zinc-700 rounded-xl p-3 text-center text-blue-400 font-bold outline-none focus:border-emerald-500"/>
                             <input type="number" placeholder="Gras(g)" value={singleFood.fat} onChange={e=>setSingleFood({...singleFood, fat:e.target.value})} className="bg-black border border-zinc-700 rounded-xl p-3 text-center text-orange-400 font-bold outline-none focus:border-emerald-500"/>
                         </div>
                         <div className="flex gap-2">
                             <input type="number" placeholder="Kcal Totales" value={singleFood.calories} onChange={e=>setSingleFood({...singleFood, calories:e.target.value})} className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-center text-white font-black outline-none focus:border-emerald-500"/>
                             <select value={singleFood.unit} onChange={e=>setSingleFood({...singleFood, unit:e.target.value})} className="w-20 bg-black border border-zinc-700 rounded-xl p-3 font-bold outline-none text-white appearance-none text-center">
                                 <option value="g">g</option><option value="ml">ml</option><option value="ud">ud</option>
                             </select>
                             <button onClick={handleSingleUpload} className="bg-emerald-500 text-black px-6 rounded-xl font-black hover:bg-emerald-400 transition-colors flex items-center justify-center">
                                 {singleFood.id ? <Check size={20}/> : <Plus size={20}/>}
                             </button>
                         </div>
                     </div>

                     {/* Gestor del Catálogo */}
                     <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="font-black text-xl">Gestor Global</h3>
                             <button onClick={handleExportTXT} className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors shadow-sm text-sm">
                                 <Download size={16}/> Exportar TXT
                             </button>
                         </div>
                         
                         <div className="relative mb-4">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
                              <input value={adminSearchTerm} onChange={e=>setAdminSearchTerm(e.target.value)} placeholder="Buscar alimento para editar..." className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white font-medium outline-none focus:border-emerald-500 transition-colors" />
                         </div>
                         
                         <div className="max-h-80 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                             {allFoodsDB.filter(f => normalizeText(f.name).includes(normalizeText(adminSearchTerm))).map(f => (
                                 <div key={f.id} className="flex justify-between items-center p-3 bg-black rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-colors group">
                                     <div className="flex items-center gap-3">
                                         <span className="text-2xl bg-zinc-900 p-2 rounded-xl border border-zinc-800">{f.emoji}</span>
                                         <div>
                                             <p className="font-bold text-sm leading-tight text-white mb-0.5">{f.name}</p>
                                             <div className="flex gap-2 text-[10px] font-bold text-zinc-500">
                                                <span>P: {f.protein}</span><span>C: {f.carbs}</span><span>G: {f.fat}</span>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => {
                                             triggerHaptic();
                                             setSingleFood({...f});
                                             document.getElementById('admin-single-form')?.scrollIntoView({behavior: 'smooth'});
                                         }} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-black transition-colors" title="Editar">
                                             <Edit2 size={16}/>
                                         </button>
                                         <button onClick={async () => {
                                             triggerHaptic();
                                             if(window.confirm(`¿Borrar definitivamente "${f.name}" de la base de datos de todos los usuarios?`)) {
                                                 await deleteDoc(doc(db, 'global_foods', f.id));
                                             }
                                         }} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-black transition-colors" title="Borrar">
                                             <Trash2 size={16}/>
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             )}
          </div>
        )}

        {/* --- DASHBOARD --- */}
        {view === 'dashboard' && !isAdmin && (
          <div className="space-y-6 animate-fade-in">
            {/* Premium Summary Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-8 bg-zinc-900 border border-zinc-800 group">
               <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500 rounded-full opacity-10 blur-[60px]"></div>
               <Flame className="absolute -right-6 -top-6 w-36 h-36 text-emerald-500/20 blur-[2px] pointer-events-none select-none" fill="currentColor" />
               
               <div className="relative z-10 mb-8">
                   <div className="flex justify-between items-end mb-4">
                       <div>
                           <p className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">Restantes Hoy</p>
                           <div className="text-7xl font-black tracking-tighter text-white drop-shadow-sm leading-none">
                               {dailyGoal - totals.cal} <span className="text-2xl font-medium text-emerald-500">kcal</span>
                           </div>
                       </div>
                       <div className="text-right pb-1">
                           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Consumidas</p>
                           <p className="text-xl font-bold text-white">{totals.cal} <span className="text-xs text-zinc-500">/ {dailyGoal}</span></p>
                       </div>
                   </div>
                   
                   <div className="h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 shadow-inner">
                       <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.6)] relative" style={{ width: `${Math.min(100, (totals.cal / dailyGoal) * 100) || 0}%` }}>
                           <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                       </div>
                   </div>
               </div>
               
               <div className="relative z-10 bg-zinc-950 p-5 rounded-3xl border border-zinc-800/50">
                   <MacroBar label="Proteína" current={totals.p} max={macroGoals.p} colorClass="bg-emerald-500" />
                   <MacroBar label="Carbohidratos" current={totals.c} max={macroGoals.c} colorClass="bg-blue-500" />
                   <MacroBar label="Grasas" current={totals.f} max={macroGoals.f} colorClass="bg-orange-500" />
               </div>
            </div>

            {/* Menú de Comidas */}
            <div className="grid gap-3">
              <h3 className="font-bold text-sm tracking-widest uppercase text-zinc-500 px-2 mt-4 mb-1">Registro Diario</h3>
              {Object.entries(MEAL_TYPES).map(([key, cfg]) => {
                const cal = myTodayFoods.filter(f => f.meal === key).reduce((a,b) => a + (b.calories || 0), 0);
                return (
                  <Card key={key} onClick={() => { triggerHaptic(); setActiveMeal(key); setView('meal-detail'); }} className="p-5 flex items-center justify-between hover:border-zinc-700 cursor-pointer">
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-0.5">{cfg.label}</h3>
                            <p className="text-zinc-500 font-bold text-xs">{cal || 0} kcal consumidas</p>
                        </div>
                    </div>
                    <div className="p-3 rounded-full bg-zinc-950 text-zinc-600">
                        <ChevronRight size={20}/>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* --- DETALLE COMIDA --- */}
        {view === 'meal-detail' && !isAdmin && (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => { triggerHaptic(); setView('dashboard'); }} className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"><ArrowLeft size={20}/></button>
                <h2 className="text-3xl font-black tracking-tight">{MEAL_TYPES[activeMeal]?.label}</h2>
            </div>
            
            <div className="flex-1 space-y-3 mb-24">
              {myTodayFoods.filter(f => f.meal === activeMeal).length === 0 ? (
                  <div className="text-center p-12 text-zinc-600 border border-zinc-800/50 rounded-3xl border-dashed">
                      <Cookie className="mx-auto mb-4 opacity-50" size={40}/>
                      <p className="font-bold">Aún no has registrado nada.</p>
                  </div>
              ) : (
                  myTodayFoods.filter(f => f.meal === activeMeal).map(f => (
                    <Card key={f.id} className="p-4 flex justify-between items-center group bg-zinc-900">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-zinc-800">{f.emoji}</div>
                          <div>
                             <p className="font-bold text-base leading-tight pr-2">{f.name}</p>
                             <div className="flex gap-2 text-[10px] font-bold mt-1">
                                <span className="text-emerald-500">{f.protein}g P</span>
                                <span className="text-blue-500">{f.carbs}g C</span>
                                <span className="text-orange-500">{f.fat}g G</span>
                                {(f.grams) && <span className="text-zinc-500 ml-1">• {f.grams}{f.unit}</span>}
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="font-black text-xl leading-none text-emerald-400">{f.calories}</p>
                             <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-500 mt-1">Kcal</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteFoodLog(f.id); }} className="text-red-500 p-2.5 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-black transition-colors">
                              <Trash2 size={16}/>
                          </button>
                       </div>
                    </Card>
                  ))
              )}
            </div>
            
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
                <button onClick={() => { triggerHaptic(); setView('add-food'); }} className="px-8 py-4 bg-emerald-500 text-zinc-950 rounded-full font-black text-lg flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform">
                    <Plus size={24} className="stroke-[3]"/> Añadir Alimento
                </button>
            </div>
          </div>
        )}

        {/* --- AÑADIR COMIDA / BASE DE DATOS MASIVA --- */}
        {view === 'add-food' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-4 mb-8">
                 <button onClick={() => { triggerHaptic(); if (selectedDbFood) setSelectedDbFood(null); else setView('meal-detail'); }} className="p-3 rounded-full bg-zinc-900 border border-zinc-800"><ArrowLeft size={20}/></button>
                 <h2 className="text-3xl font-black tracking-tight">{selectedDbFood ? 'Porción' : 'Buscador Global'}</h2>
             </div>
            
            {!selectedDbFood && (
                <div className="mb-8">
                    <button onClick={() => { triggerHaptic(); setView('scanner'); setScannedItems([]); setImagePreview(null); }} className="w-full bg-zinc-900 border border-emerald-500/30 text-emerald-400 p-5 rounded-3xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center justify-center gap-3 hover:bg-emerald-500/10 transition-colors">
                        <ScanLine size={24} /> Escáner de Plato IA <Zap size={16} className="fill-emerald-400"/>
                    </button>
                </div>
            )}

            {selectedDbFood ? (
               <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                      {(() => {
                          const val = parseFloat(gramsInput) || 0;
                          const factor = selectedDbFood.unit === 'g' || selectedDbFood.unit === 'ml' ? val/100 : val;
                          return (
                              <>
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center"><span className="block text-2xl font-black text-emerald-400">{Math.round(selectedDbFood.protein * factor)}g</span><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Prot</span></div>
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center"><span className="block text-2xl font-black text-blue-400">{Math.round(selectedDbFood.carbs * factor)}g</span><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Carb</span></div>
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center"><span className="block text-2xl font-black text-orange-400">{Math.round(selectedDbFood.fat * factor)}g</span><span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Gras</span></div>
                              </>
                          )
                      })()}
                  </div>
                  
                  <Card className="p-10 text-center bg-zinc-900/50">
                     <div className="text-6xl mb-4 drop-shadow-lg">{selectedDbFood.emoji}</div>
                     <h3 className="text-2xl font-black mb-2">{selectedDbFood.name}</h3>
                     <div className="flex items-center justify-center gap-3 mt-8">
                         <input type="number" autoFocus value={gramsInput} onChange={e=> setGramsInput(e.target.value)} placeholder="0" className="text-7xl font-black text-right w-40 bg-transparent outline-none text-white placeholder-zinc-800 caret-emerald-500" />
                         <span className="text-2xl font-bold text-zinc-600 mt-4">{selectedDbFood.unit}</span>
                     </div>
                  </Card>
                  
                  <div className="flex gap-3">
                      <button onClick={() => { triggerHaptic(); setSelectedDbFood(null); }} className="w-1/3 bg-zinc-900 text-zinc-400 p-5 rounded-2xl font-bold border border-zinc-800">Cancelar</button>
                      <button disabled={!gramsInput || parseFloat(gramsInput) <= 0} onClick={handleAddManualFood} className="w-2/3 bg-emerald-500 text-zinc-950 p-5 rounded-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-30 disabled:shadow-none">Añadir</button>
                  </div>
               </div>
            ) : (
               <div>
                  <div className="relative mb-6">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20}/>
                      <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Ej. Huevo, Manzana, Pollo..." className="w-full p-4 pl-14 rounded-2xl outline-none text-lg font-bold bg-zinc-900 border border-zinc-800 focus:border-emerald-500 transition-colors caret-emerald-500 placeholder-zinc-700"/>
                  </div>
                  
                  <div className="space-y-3">
                    {searchResults.length > 0 ? (
                        searchResults.map(f => (
                           <Card key={f.id} onClick={()=>{setSelectedDbFood(f); setGramsInput(f.unit === 'g' || f.unit === 'ml' ? '100' : '1');}} className="p-4 flex justify-between items-center hover:border-emerald-500/50 cursor-pointer transition-colors bg-zinc-900">
                              <div className="flex items-center gap-4">
                                  <span className="text-3xl bg-zinc-950 p-2 rounded-2xl border border-zinc-800">{f.emoji}</span>
                                  <div>
                                      <p className="font-bold text-lg tracking-tight">{f.name}</p>
                                      <div className="flex gap-3 text-xs font-bold mt-1">
                                          <span className="text-emerald-500">{f.protein}P</span>
                                          <span className="text-blue-500">{f.carbs}C</span>
                                          <span className="text-orange-500">{f.fat}G</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full"><Plus size={16}/></div>
                           </Card>
                        ))
                    ) : (
                        <div className="text-center p-8 text-zinc-600 border border-zinc-800 rounded-3xl border-dashed">
                            <Search className="mx-auto mb-3 opacity-50" size={32}/>
                            <p className="font-medium">No encontramos nada.</p>
                        </div>
                    )}
                  </div>
               </div>
            )}
          </div>
        )}

        {/* --- ESCÁNER IA --- */}
        {view === 'scanner' && (
          <div className="animate-fade-in h-full flex flex-col pb-10">
              <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => { triggerHaptic(); setView('add-food'); setImagePreview(null); setScannedItems([]); setIsScanning(false); }} className="p-3 rounded-full bg-zinc-900 border border-zinc-800"><ArrowLeft size={20}/></button>
                  <h2 className="text-3xl font-black tracking-tight text-emerald-400">Escáner IA</h2>
              </div>

              {!imagePreview && !isScanning && scannedItems.length === 0 && (
                  <div className="flex flex-col gap-6 mt-4">
                      <p className="text-center text-zinc-400 mb-2 font-medium text-sm">Toma una foto a tu plato o sube una imagen. La IA calculará los ingredientes y sus pesos.</p>
                      
                      <label className="bg-emerald-500 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(16,185,129,0.2)] text-zinc-950">
                          <Camera size={56} className="stroke-[1.5]" />
                          <span className="font-black text-2xl tracking-tight">Tomar Foto</span>
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                      </label>

                      <div className="relative flex items-center py-2">
                          <div className="flex-grow border-t border-zinc-800"></div>
                          <span className="flex-shrink-0 mx-4 text-zinc-600 font-bold text-xs uppercase tracking-widest">o bien</span>
                          <div className="flex-grow border-t border-zinc-800"></div>
                      </div>

                      <label className="bg-zinc-900 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl text-zinc-300 border border-zinc-800 hover:border-emerald-500/50 transition-colors group">
                          <ImageIcon size={48} className="text-emerald-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                          <span className="font-bold text-xl">Subir de Galería</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                  </div>
              )}

              {isScanning && (
                  <div className="w-full bg-zinc-900 border border-emerald-500 p-8 rounded-[2.5rem] text-center relative overflow-hidden h-64 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                      {imagePreview && <img src={imagePreview} alt="scan" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" />}
                      <ScanLine size={48} className="text-emerald-400 mb-4 animate-pulse relative z-10"/>
                      <p className="text-emerald-400 font-black text-xl relative z-10 tracking-tight">Analizando macros...</p>
                  </div>
              )}

              {scannedItems.length > 0 && (
                  <div className="space-y-6 animate-fade-in">
                      <div className="space-y-4">
                          {scannedItems.map((item) => (
                              <div key={item.id} className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 relative">
                                  <button onClick={() => { triggerHaptic(); setScannedItems(scannedItems.filter(i => i.id !== item.id)); }} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 bg-zinc-950 p-2 rounded-full transition-colors">
                                      <Trash2 size={16}/>
                                  </button>
                                  
                                  <div className="flex gap-4 items-center mb-4 pr-10">
                                      <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center text-2xl border border-zinc-800 shrink-0">{item.emoji}</div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="font-bold text-lg leading-tight mb-2 truncate text-white">{item.name}</h4>
                                          <div className="flex items-center gap-2">
                                              <input type="number" value={item.amount} onChange={(e) => setScannedItems(scannedItems.map(i => i.id === item.id ? { ...i, amount: e.target.value } : i))} className="w-20 bg-black border border-zinc-700 rounded-xl p-2 text-center font-bold text-emerald-400 outline-none focus:border-emerald-500 transition-colors" />
                                              <span className="text-sm font-bold text-zinc-500">{item.unit}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <button onClick={handleAcceptScannedItems} disabled={scannedItems.length === 0} className="w-full mt-2 bg-emerald-500 text-zinc-950 p-6 rounded-full font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-transform hover:scale-[1.02]">
                          Añadir a Diario
                      </button>
                  </div>
              )}
          </div>
        )}

      </main>
    </div>
  );
}
