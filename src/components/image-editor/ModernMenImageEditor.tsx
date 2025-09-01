'use client'

import { useState, useRef, useCallback, useEffect } from "react"
import type React from "react"
import Image from "next/image"
// Icons temporarily replaced with text placeholders due to import issues
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ImageAdjustments {
  brightness: number
  contrast: number
  saturation: number
  warmth: number
  vignette: number
  scale: number
}

interface TextOverlay {
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  font: string
  weight: string
  shadow: boolean
  outline: boolean
  outlineColor: string
  outlineWidth: number
  rotation: number
  opacity: number
  backgroundColor?: string
  padding?: number
}

interface BatchOperation {
  id: string
  name: string
  adjustments: ImageAdjustments
  textOverlays: TextOverlay[]
}

interface VersionHistory {
  id: string
  name: string
  timestamp: Date
  adjustments: ImageAdjustments
  textOverlays: TextOverlay[]
  imageData: string
}

interface AIEnhancement {
  type: "denoise" | "sharpen" | "colorize" | "upscale_ai"
  intensity: number
}

interface CustomTemplate {
  id: string
  name: string
  category: string
  adjustments: ImageAdjustments
  textOverlays: TextOverlay[]
  thumbnail: string
}

interface ExportSettings {
  format: "png" | "jpeg" | "webp" | "avif" | "tiff"
  quality: number
  width: number
  height: number
  watermark: boolean
  watermarkText: string
  watermarkPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  watermarkOpacity: number
  compression: "none" | "fast" | "best"
  includeMetadata: boolean
  dpi: number
  colorProfile: "srgb" | "adobe-rgb" | "prophoto-rgb"
  progressive: boolean
}

interface AnalyticsData {
  totalEdits: number
  favoritePresets: string[]
  timeSpent: number
  featuresUsed: string[]
}

const customTemplates: CustomTemplate[] = [
  {
    id: "social-post",
    name: "Social Media Post",
    category: "Social",
    adjustments: { brightness: 10, contrast: 20, saturation: 15, warmth: 5, vignette: 10, scale: 1 },
    textOverlays: [
      {
        text: "Your Text Here",
        x: 50,
        y: 50,
        fontSize: 32,
        color: "#ffffff",
        font: "Montserrat",
        weight: "700",
        shadow: true,
      },
    ],
    thumbnail: "/social-media-template.png",
  },
  {
    id: "business-card",
    name: "Business Card",
    category: "Business",
    adjustments: { brightness: 5, contrast: 15, saturation: -5, warmth: 0, vignette: 0, scale: 1 },
    textOverlays: [
      {
        text: "MODERN MEN",
        x: 20,
        y: 80,
        fontSize: 24,
        color: "#dc2626",
        font: "Montserrat",
        weight: "900",
        shadow: false,
      },
    ],
    thumbnail: "/business-card-template.png",
  },
  {
    id: "hero-banner",
    name: "Hero Banner",
    category: "Web",
    adjustments: { brightness: 15, contrast: 25, saturation: 10, warmth: 10, vignette: 20, scale: 1 },
    textOverlays: [
      {
        text: "HERO TITLE",
        x: 50,
        y: 40,
        fontSize: 48,
        color: "#ffffff",
        font: "Montserrat",
        weight: "900",
        shadow: true,
      },
    ],
    thumbnail: "/hero-banner-template.png",
  },
]

const brandPresets = [
  { name: "Modern Men Bold", brightness: 15, contrast: 25, saturation: -5, warmth: 0, vignette: 15 },
  { name: "Dramatic Black", brightness: -10, contrast: 35, saturation: -15, warmth: -5, vignette: 25 },
  { name: "High Contrast", brightness: 5, contrast: 40, saturation: -10, warmth: 0, vignette: 10 },
  { name: "Red Accent", brightness: 10, contrast: 20, saturation: 15, warmth: 10, vignette: 20 },
]

const advancedFilters = [
  { name: "Film Noir", brightness: -15, contrast: 45, saturation: -30, warmth: -10, vignette: 35 },
  { name: "Golden Hour", brightness: 20, contrast: 15, saturation: 10, warmth: 25, vignette: 10 },
  { name: "Cyberpunk", brightness: 10, contrast: 30, saturation: 20, warmth: -15, vignette: 20 },
  { name: "Vintage Fade", brightness: 5, contrast: -10, saturation: -20, warmth: 15, vignette: 25 },
  { name: "Modern Bold", brightness: 15, contrast: 35, saturation: 5, warmth: 0, vignette: 15 },
  { name: "Soft Glow", brightness: 10, contrast: -5, saturation: -10, warmth: 20, vignette: 30 },
  { name: "High Contrast BW", brightness: 5, contrast: 50, saturation: -100, warmth: 0, vignette: 20 },
  { name: "Warm Vintage", brightness: 8, contrast: 15, saturation: -15, warmth: 30, vignette: 25 },
  { name: "Cool Professional", brightness: 5, contrast: 20, saturation: -25, warmth: -20, vignette: 10 },
  { name: "Dramatic Shadows", brightness: -10, contrast: 40, saturation: 10, warmth: -5, vignette: 40 },
  { name: "Bright Pop", brightness: 25, contrast: 25, saturation: 30, warmth: 15, vignette: 5 },
  { name: "Muted Elegance", brightness: 0, contrast: 10, saturation: -40, warmth: 10, vignette: 20 },
]

const textPresets = [
  {
    name: "Bold Hero",
    fontSize: 48,
    color: "#ffffff",
    font: "Montserrat",
    weight: "900",
    shadow: true,
    outline: false,
    outlineColor: "#000000",
    outlineWidth: 2,
    rotation: 0,
    opacity: 1
  },
  {
    name: "Red Accent",
    fontSize: 32,
    color: "#dc2626",
    font: "Montserrat",
    weight: "700",
    shadow: false,
    outline: true,
    outlineColor: "#ffffff",
    outlineWidth: 1,
    rotation: 0,
    opacity: 1
  },
  {
    name: "White Text",
    fontSize: 18,
    color: "#ffffff",
    font: "Open Sans",
    weight: "400",
    shadow: false,
    outline: false,
    outlineColor: "#000000",
    outlineWidth: 1,
    rotation: 0,
    opacity: 1
  },
  {
    name: "Dramatic CTA",
    fontSize: 24,
    color: "#dc2626",
    font: "Montserrat",
    weight: "600",
    shadow: true,
    outline: false,
    outlineColor: "#000000",
    outlineWidth: 2,
    rotation: 0,
    opacity: 1
  },
  {
    name: "Neon Glow",
    fontSize: 36,
    color: "#00ff88",
    font: "Arial Black",
    weight: "900",
    shadow: true,
    outline: true,
    outlineColor: "#ffffff",
    outlineWidth: 3,
    rotation: 0,
    opacity: 1
  },
  {
    name: "Elegant Serif",
    fontSize: 28,
    color: "#f8f8f2",
    font: "Times New Roman",
    weight: "400",
    shadow: true,
    outline: false,
    outlineColor: "#000000",
    outlineWidth: 1,
    rotation: -2,
    opacity: 0.9
  },
]

const stickerLibrary = [
  // Emojis
  "😀", "😂", "🥰", "😍", "🤗", "🤔", "😎", "🥳", "😊", "😉",
  "👍", "👎", "👌", "✌️", "🤞", "👏", "🙌", "🤝", "🙏", "💪",
  "❤️", "💙", "💜", "💛", "💚", "🖤", "🤍", "🤎", "💖", "💕",
  "🌟", "⭐", "✨", "💫", "🔥", "💯", "🎉", "🎊", "🎈", "🎁",
  "💎", "💍", "👑", "🎩", "🕶️", "👓", "🥽", "🧢", "🎓", "👒",
  "📱", "💻", "⌚", "📷", "🎥", "📺", "🔊", "🎵", "🎶", "🎤",
  "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🥍", "🏒",
  "🎨", "🎭", "🎪", "🎪", "🎨", "🖼️", "🎨", "🎭", "🎪", "🎭",
  "🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🍪", "🧁", "🍰", "🎂",
  "☕", "🧃", "🧊", "🥤", "🍵", "🫖", "🍶", "🍺", "🍻", "🥂",
  "🌺", "🌸", "🌼", "🌻", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼",
  "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
  "✈️", "🚀", "🚁", "🚤", "🚢", "🚂", "🚆", "🚊", "🚟", "🚠",
  "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤",
  "⛰️", "🏔️", "🗻", "🌋", "🏜️", "🏖️", "🏝️", "🏞️", "🏕️", "🏔️",
  "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷",
  "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🥍", "🏒",
  "🎯", "🎳", "🎮", "🕹️", "🎲", "🧩", "♠️", "♥️", "♦️", "♣️",
  "🦋", "🐛", "🐜", "🐝", "🐞", "🦗", "🕷️", "🦂", "🐌", "🐙",
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
  "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
  "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜",
  "🌱", "🌿", "☘️", "🍀", "🎋", "🎍", "🌾", "🌵", "🌲", "🌳",
  "🌴", "🌸", "🌺", "🌻", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼",
  "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑",
  "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒",
  "🌶️", "🥕", "🧄", "🧅", "🥔", "🍠", "🌽", "🥖", "🥨", "🧀",
  "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭",
  "🍔", "🍟", "🍕", "🌮", "🌯", "🫔", "🥙", "🌮", "🍝", "🍜",
  "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘",
  "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁",
  "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🥠",
  "☕", "🫖", "🍵", "🥛", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻",
  "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾", "🧊", "🥄", "🍴",
  "🍽️", "🥣", "🥡", "🥢", "🧷", "🔪", "🫙", "🏺", "🌍", "🌎",
  "🌏", "🗺️", "🗾", "🧭", "🏔️", "⛰️", "🌋", "🗻", "🏕️", "🏖️",
  "🏜️", "🏝️", "🏞️", "🏟️", "🏛️", "🏗️", "🧱", "🪨", "🪵", "🛖",
  "🏘️", "🏚️", "🏠", "🏡", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦",
  "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "💒", "🗼",
  "🗽", "⛪", "🕌", "🛕", "🕍", "⛩️", "🕋", "⛲", "⛺", "🌁",
  "🌃", "🏙️", "🌄", "🌅", "🌆", "🌇", "🌉", "♨️", "🎠", "🎡",
  "🎢", "💈", "🎪", "🚂", "🚃", "🚄", "🚅", "🚆", "🚇", "🚈",
  "🚉", "🚊", "🚝", "🚞", "🚋", "🚌", "🚍", "🚎", "🚐", "🚑",
  "🚒", "🚓", "🚔", "🚕", "🚖", "🚗", "🚘", "🚙", "🚚", "🚛",
  "🚜", "🏎️", "🏍️", "🛵", "🚲", "🛴", "🛹", "🚏", "🛣️", "🛤️",
  "🛢️", "⛽", "🚨", "🚥", "🚦", "🛑", "🚧", "⚓", "⛵", "🛶",
  "🚤", "🛳️", "⛴️", "🛥️", "🚢", "✈️", "🛩️", "🛫", "🛬", "🪂",
  "💺", "🚁", "🚟", "🚠", "🚡", "🛤️", "🛲", "⛽", "🚧", "⛽",
]

const stickerCategories = [
  { name: "Faces", start: 0, end: 29 },
  { name: "Gestures", start: 30, end: 59 },
  { name: "Hearts", start: 60, end: 89 },
  { name: "Stars", start: 90, end: 119 },
  { name: "Fashion", start: 120, end: 149 },
  { name: "Tech", start: 150, end: 179 },
  { name: "Sports", start: 180, end: 209 },
  { name: "Art", start: 210, end: 239 },
  { name: "Food", start: 240, end: 269 },
  { name: "Drinks", start: 270, end: 299 },
  { name: "Flowers", start: 300, end: 329 },
  { name: "Vehicles", start: 330, end: 359 },
  { name: "Transport", start: 360, end: 389 },
  { name: "Buildings", start: 390, end: 419 },
  { name: "Nature", start: 420, end: 449 },
  { name: "Music", start: 450, end: 479 },
  { name: "Games", start: 480, end: 509 },
  { name: "Insects", start: 510, end: 539 },
  { name: "Animals", start: 540, end: 569 },
  { name: "Birds", start: 570, end: 599 },
  { name: "Wildlife", start: 600, end: 629 },
  { name: "Plants", start: 630, end: 659 },
  { name: "Fruits", start: 660, end: 689 },
  { name: "Veggies", start: 690, end: 719 },
  { name: "Spices", start: 720, end: 749 },
  { name: "Bakery", start: 750, end: 779 },
  { name: "Meals", start: 780, end: 809 },
  { name: "Sushi", start: 810, end: 839 },
  { name: "Desserts", start: 840, end: 869 },
  { name: "Beverages", start: 870, end: 899 },
  { name: "Cutlery", start: 900, end: 929 },
  { name: "World", start: 930, end: 959 },
  { name: "Mountains", start: 960, end: 989 },
  { name: "Cities", start: 990, end: 1019 },
  { name: "Landmarks", start: 1020, end: 1049 },
  { name: "Weather", start: 1050, end: 1079 },
  { name: "Entertainment", start: 1080, end: 1109 },
  { name: "Trains", start: 1110, end: 1139 },
  { name: "Cars", start: 1140, end: 1169 },
  { name: "Roads", start: 1170, end: 1199 },
  { name: "Water", start: 1200, end: 1229 },
  { name: "Air", start: 1230, end: 1259 },
]

const modernMenPages = [
  {
    id: "home",
    name: "Homepage",
    description: "Main landing page with hero section",
    template: (imageUrl: string) => (
      <div className="bg-black min-h-screen text-white">
        <nav className="bg-black border-b border-red-600 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-black text-white">MODERN MEN</h1>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                Services
              </a>
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                About
              </a>
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </nav>
        <div className="relative h-96 bg-black flex items-center justify-center overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt="Hero"
            width={800}
            height={384}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 text-center text-white">
            <h2 className="text-5xl font-black mb-4">WE ARE MODERNMEN</h2>
            <p className="text-xl text-red-600 font-semibold">Classic craft, modern results.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "services",
    name: "Services Page",
    description: "Service showcase with image gallery",
    template: (imageUrl: string) => (
      <div className="bg-black min-h-screen text-white">
        <nav className="bg-black border-b border-red-600 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-black text-white">MODERN MEN</h1>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                Services
              </a>
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                About
              </a>
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-4xl font-black text-center mb-12 text-red-600">OUR SERVICES</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-red-600">
              <Image src={imageUrl || "/placeholder.svg"} alt="Service" width={400} height={192} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">Premium Haircut</h3>
                <p className="text-gray-300">Professional styling for the modern gentleman</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="w-full h-48 bg-gray-800"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">Hot Towel Shave</h3>
                <p className="text-gray-300">Traditional barbering experience</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="w-full h-48 bg-gray-800"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">Beard Grooming</h3>
                <p className="text-gray-300">Expert beard trimming and styling</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "about",
    name: "About Page",
    description: "Team and story section",
    template: (imageUrl: string) => (
      <div className="bg-black min-h-screen text-white">
        <nav className="bg-black border-b border-red-600 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-black text-white">MODERN MEN</h1>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                Services
              </a>
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                About
              </a>
              <a href="#" className="text-white hover:text-red-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 text-red-600">OUR STORY</h2>
              <p className="text-lg text-white mb-6">
                Modern Men combines traditional barbering techniques with contemporary style to deliver exceptional
                grooming experiences for today's gentleman.
              </p>
              <p className="text-gray-300">
                Our skilled barbers are passionate about their craft and committed to helping you look and feel your
                best.
              </p>
            </div>
            <div className="relative">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="About"
                width={600}
                height={384}
                className="w-full h-96 object-cover rounded-lg shadow-lg border border-red-600"
              />
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

const keyboardShortcuts = [
  { key: "Ctrl+Z", action: "Undo", description: "Undo last action" },
  { key: "Ctrl+Y", action: "Redo", description: "Redo last action" },
  { key: "Ctrl+S", action: "Save", description: "Save current version" },
  { key: "Ctrl+E", action: "Export", description: "Export image" },
  { key: "Space", action: "Preview", description: "Toggle preview mode" },
  { key: "R", action: "Reset", description: "Reset all adjustments" },
]

const premadeTemplates = [
  {
    id: "instagram-post",
    name: "Instagram Post",
    category: "Social Media",
    dimensions: { width: 1080, height: 1080 },
    adjustments: { brightness: 10, contrast: 20, saturation: 15, warmth: 5, vignette: 10, scale: 1 },
    textOverlays: [
      {
        text: "Your Caption Here",
        x: 540,
        y: 950,
        fontSize: 36,
        color: "#ffffff",
        font: "Montserrat",
        weight: "700",
        shadow: true,
      },
    ],
    thumbnail: "/instagram-template.png",
  },
  {
    id: "facebook-cover",
    name: "Facebook Cover",
    category: "Social Media",
    dimensions: { width: 1200, height: 630 },
    adjustments: { brightness: 15, contrast: 25, saturation: 10, warmth: 10, vignette: 20, scale: 1 },
    textOverlays: [
      {
        text: "COVER TEXT",
        x: 600,
        y: 315,
        fontSize: 48,
        color: "#ffffff",
        font: "Montserrat",
        weight: "900",
        shadow: true,
      },
    ],
    thumbnail: "/facebook-cover-template.png",
  },
  {
    id: "youtube-thumbnail",
    name: "YouTube Thumbnail",
    category: "Video",
    dimensions: { width: 1280, height: 720 },
    adjustments: { brightness: 20, contrast: 30, saturation: 20, warmth: 5, vignette: 15, scale: 1 },
    textOverlays: [
      {
        text: "CLICK HERE!",
        x: 640,
        y: 360,
        fontSize: 64,
        color: "#dc2626",
        font: "Montserrat",
        weight: "900",
        shadow: true,
      },
    ],
    thumbnail: "/youtube-thumbnail-template.png",
  },
  {
    id: "business-card-modern",
    name: "Modern Business Card",
    category: "Business",
    dimensions: { width: 1050, height: 600 },
    adjustments: { brightness: 5, contrast: 15, saturation: -5, warmth: 0, vignette: 0, scale: 1 },
    textOverlays: [
      {
        text: "MODERN MEN",
        x: 525,
        y: 480,
        fontSize: 32,
        color: "#dc2626",
        font: "Montserrat",
        weight: "900",
        shadow: false,
      },
    ],
    thumbnail: "/business-card-modern-template.png",
  },
  {
    id: "website-hero",
    name: "Website Hero Banner",
    category: "Web",
    dimensions: { width: 1920, height: 800 },
    adjustments: { brightness: 15, contrast: 25, saturation: 10, warmth: 10, vignette: 20, scale: 1 },
    textOverlays: [
      {
        text: "HERO TITLE",
        x: 960,
        y: 320,
        fontSize: 72,
        color: "#ffffff",
        font: "Montserrat",
        weight: "900",
        shadow: true,
      },
      {
        text: "Subtitle goes here",
        x: 960,
        y: 420,
        fontSize: 24,
        color: "#dc2626",
        font: "Open Sans",
        weight: "600",
        shadow: false,
      },
    ],
    thumbnail: "/hero-banner-template.png",
  },
  {
    id: "product-showcase",
    name: "Product Showcase",
    category: "E-commerce",
    dimensions: { width: 800, height: 800 },
    adjustments: { brightness: 20, contrast: 15, saturation: 5, warmth: 0, vignette: 5, scale: 1 },
    textOverlays: [
      {
        text: "NEW PRODUCT",
        x: 400,
        y: 100,
        fontSize: 28,
        color: "#dc2626",
        font: "Montserrat",
        weight: "700",
        shadow: false,
      },
    ],
    thumbnail: "/product-showcase-template.png",
  },
]

export default function ModernMenImageEditor() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    vignette: 0,
    scale: 1,
  })
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([])
  const [activeTextIndex, setActiveTextIndex] = useState<number | null>(null)
  const [cropMode, setCropMode] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [selectedPage, setSelectedPage] = useState("home")
  const [previewDevice, setPreviewDevice] = useState("desktop")
  const [fetchedHtml, setFetchedHtml] = useState<string>("")
  const [isLoadingHtml, setIsLoadingHtml] = useState(false)
  const [replaceableImages, setReplaceableImages] = useState<
    Array<{ id: string; src: string; alt: string; element: string }>
  >([])
  const [selectedImageToReplace, setSelectedImageToReplace] = useState<string | null>(null)

  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([])
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([])
  const [aiEnhancement, setAiEnhancement] = useState<AIEnhancement>({ type: "denoise", intensity: 50 })
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [collaborationMode, setCollaborationMode] = useState(false)
  const [sharedLink, setSharedLink] = useState<string>("")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: "png",
    quality: 90,
    width: 1920,
    height: 1080,
    watermark: false,
    watermarkText: "MODERN MEN",
    watermarkPosition: "bottom-right",
    watermarkOpacity: 0.7,
    compression: "best",
    includeMetadata: true,
    dpi: 300,
    colorProfile: "srgb",
    progressive: true,
  })
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEdits: 0,
    favoritePresets: [],
    timeSpent: 0,
    featuresUsed: [],
  })
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [undoStack, setUndoStack] = useState<Array<{ adjustments: ImageAdjustments; textOverlays: TextOverlay[] }>>([])
  const [redoStack, setRedoStack] = useState<Array<{ adjustments: ImageAdjustments; textOverlays: TextOverlay[] }>>([])

  const [selectedTool, setSelectedTool] = useState<"select" | "crop" | "text" | "sticker">("select")
  const [stickers, setStickers] = useState<Array<{ id: string; emoji: string; x: number; y: number; size: number }>>([])
  const [showStickerPanel, setShowStickerPanel] = useState(false)
  const [realTimePreview, setRealTimePreview] = useState(true)

  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>("All")
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [cropAspectRatio, setCropAspectRatio] = useState<string>("free")
  const [filterIntensity, setFilterIntensity] = useState(100)
  const [showAdvancedTools, setShowAdvancedTools] = useState(false)
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<string>("Faces")

  const [isInlineEditing, setIsInlineEditing] = useState(false)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editingImageSrc, setEditingImageSrc] = useState<string>("")

  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [colorTint, setColorTint] = useState<"none" | "vintage" | "blackwhite" | "sepia" | "warm" | "cool">("none")
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")

  const [previewMode, setPreviewMode] = useState<"live" | "side-by-side">("live")
  const [showEditingOverlay, setShowEditingOverlay] = useState(false)
  const [editingPosition, setEditingPosition] = useState({ x: 0, y: 0 })
  const [quickEditMode, setQuickEditMode] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [editingHistory, setEditingHistory] = useState<
    Array<{ imageId: string; originalSrc: string; editedSrc: string }>
  >([])
  const [batchMode, setBatchMode] = useState(false)
  const [batchImages, setBatchImages] = useState<Array<{ id: string; file: File; preview: string; processed?: boolean }>>([])
  const [batchProgress, setBatchProgress] = useState(0)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setAdjustments({ brightness: 0, contrast: 0, saturation: 0, warmth: 0, vignette: 0, scale: 1 })
        setTextOverlays([])
        setCropMode(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const addSticker = (emoji: string) => {
    const newSticker = {
      id: Date.now().toString(),
      emoji,
      x: canvasRef.current ? canvasRef.current.width / 2 : 400,
      y: canvasRef.current ? canvasRef.current.height / 2 : 300,
      size: 48,
    }
    setStickers([...stickers, newSticker])
    setShowStickerPanel(false)
  }

  // Crop functionality
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on resize handles
    const handles = getCropHandles()
    for (const [handleName, handlePos] of Object.entries(handles)) {
      if (Math.abs(x - handlePos.x) < 10 && Math.abs(y - handlePos.y) < 10) {
        setIsResizing(true)
        setResizeHandle(handleName)
        setCropStart({ x, y })
        return
      }
    }

    // Check if clicking inside crop area
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true)
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y })
    } else {
      // Start new crop area
      setCropStart({ x, y })
      setCropArea({ x, y, width: 0, height: 0 })
      setIsDragging(true)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isResizing && resizeHandle) {
      const newCropArea = { ...cropArea }

      switch (resizeHandle) {
        case 'nw':
          newCropArea.x = x
          newCropArea.y = y
          newCropArea.width = cropArea.x + cropArea.width - x
          newCropArea.height = cropArea.y + cropArea.height - y
          break
        case 'ne':
          newCropArea.y = y
          newCropArea.width = x - cropArea.x
          newCropArea.height = cropArea.y + cropArea.height - y
          break
        case 'sw':
          newCropArea.x = x
          newCropArea.width = cropArea.x + cropArea.width - x
          newCropArea.height = y - cropArea.y
          break
        case 'se':
          newCropArea.width = x - cropArea.x
          newCropArea.height = y - cropArea.y
          break
      }

      // Ensure minimum size
      if (newCropArea.width > 10 && newCropArea.height > 10) {
        setCropArea(newCropArea)
      }
    } else if (isDragging) {
      if (cropArea.width === 0 && cropArea.height === 0) {
        // Creating new crop area
        const width = x - cropStart.x
        const height = y - cropStart.y
        setCropArea({
          x: width > 0 ? cropStart.x : x,
          y: height > 0 ? cropStart.y : y,
          width: Math.abs(width),
          height: Math.abs(height)
        })
      } else {
        // Moving existing crop area
        setCropArea({
          ...cropArea,
          x: x - dragStart.x,
          y: y - dragStart.y
        })
      }
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }

  const getCropHandles = () => {
    return {
      nw: { x: cropArea.x, y: cropArea.y },
      ne: { x: cropArea.x + cropArea.width, y: cropArea.y },
      sw: { x: cropArea.x, y: cropArea.y + cropArea.height },
      se: { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
    }
  }

  const applyCrop = () => {
    if (!canvasRef.current || !uploadedImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement("canvas")
    const croppedCtx = croppedCanvas.getContext("2d")
    if (!croppedCtx) return

    croppedCanvas.width = cropArea.width
    croppedCanvas.height = cropArea.height

    // Draw the cropped portion
    croppedCtx.drawImage(
      canvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    )

    // Update the main canvas
    canvas.width = cropArea.width
    canvas.height = cropArea.height
    ctx.drawImage(croppedCanvas, 0, 0)

    // Reset crop area
    setCropArea({ x: 0, y: 0, width: 0, height: 0 })
    setCropMode(false)

    // Update analytics
    setAnalytics((prev) => ({
      ...prev,
      totalEdits: prev.totalEdits + 1,
      featuresUsed: [...new Set([...prev.featuresUsed, "crop"])],
    }))
  }

  const applyAdjustmentsRealTime = useCallback(
    async (targetCanvas?: HTMLCanvasElement) => {
      const canvas = targetCanvas || canvasRef.current
      if (!image || !canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = imageDimensions.width
      canvas.height = imageDimensions.height

      // Apply filters in real-time
      const filters = [
        `brightness(${100 + brightness}%)`,
        `contrast(${100 + contrast}%)`,
        `saturate(${100 + saturation}%)`,
      ]

      // Add color tint effects
      if (colorTint !== "none") {
        switch (colorTint) {
          case "vintage":
            filters.push("sepia(30%) hue-rotate(15deg)")
            break
          case "blackwhite":
            filters.push("grayscale(100%)")
            break
          case "sepia":
            filters.push("sepia(100%)")
            break
          case "warm":
            filters.push("sepia(20%) hue-rotate(10deg)")
            break
          case "cool":
            filters.push("hue-rotate(-10deg) saturate(120%)")
            break
        }
      }

      ctx.filter = filters.join(" ")
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(image, 0, 0, imageDimensions.width, imageDimensions.height)

      // Apply text overlays
      textOverlays.forEach((overlay) => {
        ctx.font = `${overlay.weight} ${overlay.fontSize}px ${overlay.font}`
        ctx.fillStyle = overlay.color
        ctx.textAlign = "center"

        if (overlay.shadow) {
          ctx.shadowColor = "rgba(0,0,0,0.5)"
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
        }

        ctx.fillText(overlay.text, overlay.x, overlay.y)

        if (overlay.shadow) {
          ctx.shadowColor = "transparent"
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
      })

      // Apply stickers
      stickers.forEach((sticker) => {
        ctx.font = `${sticker.size}px Arial`
        ctx.textAlign = "center"
        ctx.fillText(sticker.emoji, sticker.x, sticker.y)
      })

      // Auto-save if enabled
      if (autoSave && editingImageId) {
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)
        updateImageInHtml(editingImageId, imageDataUrl)
      }
    },
    [
      image,
      imageDimensions,
      brightness,
      contrast,
      saturation,
      colorTint,
      textOverlays,
      stickers,
      autoSave,
      editingImageId,
    ],
  )

  const applyAdjustments = useCallback(async () => {
    if (!uploadedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx || !imageRef.current) return

    const scaledWidth = imageRef.current.naturalWidth * adjustments.scale
    const scaledHeight = imageRef.current.naturalHeight * adjustments.scale

    canvas.width = scaledWidth
    canvas.height = scaledHeight

    const filters = [
      `brightness(${100 + adjustments.brightness}%)`,
      `contrast(${100 + adjustments.contrast}%)`,
      `saturate(${100 + adjustments.saturation}%)`,
      `sepia(${Math.max(0, adjustments.warmth)}%) hue-rotate(${adjustments.warmth > 0 ? 10 : -10}deg)`,
    ].join(" ")

    ctx.filter = filters
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(imageRef.current, 0, 0, scaledWidth, scaledHeight)

    if (adjustments.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2,
      )
      gradient.addColorStop(0, `rgba(0,0,0,0)`)
      gradient.addColorStop(1, `rgba(0,0,0,${adjustments.vignette / 100})`)

      ctx.globalCompositeOperation = "multiply"
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = "source-over"
    }

    textOverlays.forEach((overlay, index) => {
      ctx.save()

      // Set global opacity
      ctx.globalAlpha = overlay.opacity

      // Apply rotation
      if (overlay.rotation !== 0) {
        ctx.translate(overlay.x * adjustments.scale, overlay.y * adjustments.scale)
        ctx.rotate((overlay.rotation * Math.PI) / 180)
        ctx.translate(-overlay.x * adjustments.scale, -overlay.y * adjustments.scale)
      }

      ctx.font = `${overlay.weight} ${overlay.fontSize * adjustments.scale}px ${overlay.font}`
      ctx.textAlign = "center"

      // Draw text outline if enabled
      if (overlay.outline) {
        ctx.strokeStyle = overlay.outlineColor
        ctx.lineWidth = overlay.outlineWidth * adjustments.scale
        ctx.strokeText(overlay.text, overlay.x * adjustments.scale, overlay.y * adjustments.scale)
      }

      // Draw text shadow if enabled
      if (overlay.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.5)"
        ctx.shadowBlur = 4 * adjustments.scale
        ctx.shadowOffsetX = 2 * adjustments.scale
        ctx.shadowOffsetY = 2 * adjustments.scale
      }

      // Draw background if specified
      if (overlay.backgroundColor) {
        const metrics = ctx.measureText(overlay.text)
        const padding = (overlay.padding || 8) * adjustments.scale
        const bgWidth = metrics.width + (padding * 2)
        const bgHeight = overlay.fontSize * adjustments.scale + (padding * 2)

        ctx.fillStyle = overlay.backgroundColor
        ctx.fillRect(
          overlay.x * adjustments.scale - bgWidth / 2,
          overlay.y * adjustments.scale - bgHeight + padding,
          bgWidth,
          bgHeight
        )
      }

      // Draw the text
      ctx.fillStyle = overlay.color
      ctx.fillText(overlay.text, overlay.x * adjustments.scale, overlay.y * adjustments.scale)

      // Reset shadow
      if (overlay.shadow) {
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }

      ctx.restore()
    })

    stickers.forEach((sticker) => {
      ctx.font = `${sticker.size * adjustments.scale}px Arial`
      ctx.textAlign = "center"
      ctx.fillText(sticker.emoji, sticker.x * adjustments.scale, sticker.y * adjustments.scale)
    })
  }, [uploadedImage, adjustments, textOverlays, stickers])

  const saveToHistory = useCallback(() => {
    if (!canvasRef.current) return

    const newVersion: VersionHistory = {
      id: Date.now().toString(),
      name: `Version ${versionHistory.length + 1}`,
      timestamp: new Date(),
      adjustments: { ...adjustments },
      textOverlays: [...textOverlays],
      imageData: canvasRef.current.toDataURL(),
    }

    setVersionHistory((prev) => [...prev, newVersion].slice(-10)) // Keep last 10 versions
  }, [adjustments, textOverlays, versionHistory.length])

  const saveBatchOperation = useCallback(() => {
    const newOperation: BatchOperation = {
      id: Date.now().toString(),
      name: `Batch ${batchOperations.length + 1}`,
      adjustments: { ...adjustments },
      textOverlays: [...textOverlays],
    }
    setBatchOperations((prev) => [...prev, newOperation])
  }, [adjustments, textOverlays, batchOperations.length])

  const applyBatchOperation = useCallback((operation: BatchOperation) => {
    setAdjustments(operation.adjustments)
    setTextOverlays(operation.textOverlays)
  }, [])

  const applyAIEnhancement = useCallback(async () => {
    if (!canvasRef.current || !uploadedImage) return

    setIsProcessingAI(true)

    // Simulate AI processing with enhanced filters
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Apply AI-like enhancements based on type
    switch (aiEnhancement.type) {
      case "denoise":
        // Simple noise reduction simulation
        for (let i = 0; i < data.length; i += 4) {
          const intensity = aiEnhancement.intensity / 100
          data[i] = data[i] * (1 - intensity * 0.1) + data[i] * intensity
          data[i + 1] = data[i + 1] * (1 - intensity * 0.1) + data[i + 1] * intensity
          data[i + 2] = data[i + 2] * (1 - intensity * 0.1) + data[i + 2] * intensity
        }
        break
      case "sharpen":
        // Simple sharpening simulation
        const intensity = aiEnhancement.intensity / 100
        setAdjustments((prev) => ({ ...prev, contrast: prev.contrast + intensity * 20 }))
        break
      case "colorize":
        // Color enhancement
        for (let i = 0; i < data.length; i += 4) {
          const intensity = aiEnhancement.intensity / 100
          data[i] = Math.min(255, data[i] * (1 + intensity * 0.2))
          data[i + 1] = Math.min(255, data[i + 1] * (1 + intensity * 0.15))
          data[i + 2] = Math.min(255, data[i + 2] * (1 + intensity * 0.1))
        }
        break
    }

    if (aiEnhancement.type !== "sharpen") {
      ctx.putImageData(imageData, 0, 0)
    }

    setTimeout(() => setIsProcessingAI(false), 2000) // Simulate processing time
  }, [aiEnhancement, uploadedImage])

  const generateShareLink = useCallback(() => {
    const shareData = {
      adjustments,
      textOverlays,
      timestamp: Date.now(),
    }
    const encoded = btoa(JSON.stringify(shareData))
    const link = `${window.location.origin}?shared=${encoded}`
    setSharedLink(link)
    navigator.clipboard.writeText(link)
  }, [adjustments, textOverlays])

  const applyTemplate = useCallback(
    (template: CustomTemplate) => {
      // Save current state to undo stack
      setUndoStack((prev) => [...prev, { adjustments, textOverlays }])
      setRedoStack([])

      setAdjustments(template.adjustments)
      setTextOverlays(template.textOverlays)
      setSelectedTemplate(template.id)

      // Update analytics
      setAnalytics((prev) => ({
        ...prev,
        totalEdits: prev.totalEdits + 1,
        featuresUsed: [...new Set([...prev.featuresUsed, "template"])],
      }))
    },
    [adjustments, textOverlays],
  )

  const undo = useCallback(() => {
    if (undoStack.length === 0) return

    const lastState = undoStack[undoStack.length - 1]
    setRedoStack((prev) => [...prev, { adjustments, textOverlays }])
    setUndoStack((prev) => prev.slice(0, -1))

    setAdjustments(lastState.adjustments)
    setTextOverlays(lastState.textOverlays)
  }, [undoStack, adjustments, textOverlays])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return

    const nextState = redoStack[redoStack.length - 1]
    setUndoStack((prev) => [...prev, { adjustments, textOverlays }])
    setRedoStack((prev) => prev.slice(0, -1))

    setAdjustments(nextState.adjustments)
    setTextOverlays(nextState.textOverlays)
  }, [redoStack, adjustments, textOverlays])

  const exportWithSettings = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const exportCanvas = document.createElement("canvas")
    const ctx = exportCanvas.getContext("2d")
    if (!ctx) return

    exportCanvas.width = exportSettings.width
    exportCanvas.height = exportSettings.height

    // Set canvas properties based on settings
    if (exportSettings.progressive) {
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
    }

    // Draw scaled image
    ctx.drawImage(canvas, 0, 0, exportSettings.width, exportSettings.height)

    // Add watermark if enabled
    if (exportSettings.watermark && exportSettings.watermarkText) {
      ctx.save()
      ctx.globalAlpha = exportSettings.watermarkOpacity
      ctx.fillStyle = "rgba(220, 38, 38, 0.8)"
      ctx.font = "bold 20px Montserrat"
      ctx.textAlign = "center"

      let x = exportSettings.width / 2
      let y = exportSettings.height / 2

      switch (exportSettings.watermarkPosition) {
        case "top-left":
          ctx.textAlign = "left"
          x = 30
          y = 30
          break
        case "top-right":
          ctx.textAlign = "right"
          x = exportSettings.width - 30
          y = 30
          break
        case "bottom-left":
          ctx.textAlign = "left"
          x = 30
          y = exportSettings.height - 30
          break
        case "bottom-right":
          ctx.textAlign = "right"
          x = exportSettings.width - 30
          y = exportSettings.height - 30
          break
        case "center":
          ctx.textAlign = "center"
          x = exportSettings.width / 2
          y = exportSettings.height / 2
          break
      }

      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(0,0,0,0.5)"
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      ctx.fillText(exportSettings.watermarkText, x, y)
      ctx.restore()
    }

    // Determine MIME type and quality
    let mimeType = `image/${exportSettings.format}`
    let quality = exportSettings.quality / 100

    // Adjust for different formats
    if (exportSettings.format === "png") {
      quality = undefined // PNG doesn't use quality parameter
    } else if (exportSettings.format === "webp" || exportSettings.format === "avif") {
      quality = Math.min(quality, 0.95) // WebP and AVIF have different quality ranges
    }

    // Export with specified format and quality
    const dataUrl = exportCanvas.toDataURL(mimeType, quality)

    const link = document.createElement("a")
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    link.download = `modern-men-${timestamp}.${exportSettings.format}`
    link.href = dataUrl
    link.click()

    // Update analytics
    setAnalytics((prev) => ({
      ...prev,
      featuresUsed: [...new Set([...prev.featuresUsed, "export"])],
    }))
  }, [exportSettings])

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault()
            undo()
            break
          case "y":
            e.preventDefault()
            redo()
            break
          case "s":
            e.preventDefault()
            saveToHistory()
            break
          case "e":
            e.preventDefault()
            exportWithSettings()
            break
        }
      } else {
        switch (e.key) {
          case " ":
            e.preventDefault()
            // Toggle preview mode logic here
            break
          case "r":
            if (!e.ctrlKey && !e.metaKey) {
              setAdjustments({
                brightness: 0,
                contrast: 0,
                saturation: 0,
                warmth: 0,
                vignette: 0,
                scale: 1,
              })
              setTextOverlays([])
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyboard)
    return () => window.removeEventListener("keydown", handleKeyboard)
  }, [undo, redo, saveToHistory, exportWithSettings])

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      applyAdjustments()
    }
  }, [applyAdjustments])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (uploadedImage) {
        saveToHistory()
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [adjustments, textOverlays, saveToHistory, uploadedImage])

  const applyPreset = (preset: (typeof brandPresets)[0]) => {
    setAdjustments({
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
      warmth: preset.warmth,
      vignette: preset.vignette,
      scale: 1,
    })
  }

  const addTextOverlay = (preset?: (typeof textPresets)[0]) => {
    const newOverlay: TextOverlay = {
      text: preset ? "Your Text Here" : "New Text",
      x: canvasRef.current ? canvasRef.current.width / 2 : 400,
      y: canvasRef.current ? canvasRef.current.height / 2 : 300,
      fontSize: preset?.fontSize || 24,
      color: preset?.color || "#ffffff",
      font: preset?.font || "Montserrat",
      weight: preset?.weight || "600",
      shadow: preset?.shadow || false,
      outline: preset?.outline || false,
      outlineColor: preset?.outlineColor || "#000000",
      outlineWidth: preset?.outlineWidth || 2,
      rotation: preset?.rotation || 0,
      opacity: preset?.opacity || 1,
    }
    setTextOverlays([...textOverlays, newOverlay])
    setActiveTextIndex(textOverlays.length)
  }

  const saveImage = (format: "png" | "jpeg" | "webp") => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const link = document.createElement("a")

    const mimeType = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png"
    const quality = format === "jpeg" ? 0.9 : undefined

    link.download = `modern-men-edited.${format}`
    link.href = canvas.toDataURL(mimeType, quality)
    link.click()
  }

  const processHtmlForEditing = (html: string) => {
    if (!html) return html

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const images = doc.querySelectorAll("img")

    images.forEach((img, index) => {
      img.style.cursor = "pointer"
      img.style.border = "2px solid transparent"
      img.style.transition = "all 0.2s ease"
      img.setAttribute("data-editable", "true")
      img.setAttribute("data-image-id", `img-${index}`)

      // Add hover effect
      img.addEventListener("mouseenter", () => {
        img.style.border = "2px solid #ef4444"
        img.style.opacity = "0.8"
      })

      img.addEventListener("mouseleave", () => {
        img.style.border = "2px solid transparent"
        img.style.opacity = "1"
      })

      // Add click handler for editing
      img.addEventListener("click", (e) => {
        e.preventDefault()
        const imageId = img.getAttribute("data-image-id")
        if (imageId) {
          setEditingImageId(imageId)
          setEditingImageSrc(img.src)
          setIsInlineEditing(true)

          // Load the image for editing
          const newImg = new (window.Image as any)()
          newImg.crossOrigin = "anonymous"
          newImg.onload = () => {
            setImage(newImg)
            setImageDimensions({ width: newImg.width, height: newImg.height })
          }
          newImg.src = img.src
        }
      })
    })

    return doc.documentElement.outerHTML
  }

  const fetchPageHtml = async (pageUrl: string) => {
    setIsLoadingHtml(true)
    try {
      const response = await fetch(`/api/fetch-html?url=${encodeURIComponent(pageUrl)}`)
      if (response.ok) {
        const html = await response.text()
        const processedHtml = processHtmlForEditing(html)
        setFetchedHtml(processedHtml)

        // Parse HTML to find replaceable images
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, "text/html")
        const images = Array.from(doc.querySelectorAll("img")).map((img, index) => ({
          id: `img-${index}`,
          src: img.src,
          alt: img.alt || "Image",
          element: img.outerHTML,
        }))
        setReplaceableImages(images)
      }
    } catch (error) {
      console.error("Failed to fetch HTML:", error)
      setFetchedHtml("")
      setReplaceableImages([])
    }
    setIsLoadingHtml(false)
  }

  const applyEditedImageToHtml = () => {
    if (!editingImageId || !canvasRef.current || !fetchedHtml) return

    const canvas = canvasRef.current
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)

    const parser = new DOMParser()
    const doc = parser.parseFromString(fetchedHtml, "text/html")
    const imgElements = doc.querySelectorAll("img[data-image-id]")

    imgElements.forEach((img) => {
      if (img.getAttribute("data-image-id") === editingImageId) {
        img.setAttribute("src", imageDataUrl)
      }
    })

    setFetchedHtml(doc.documentElement.outerHTML)
    setIsInlineEditing(false)
    setEditingImageId(null)
    setEditingImageSrc("")
  }

  const replaceImageInHtml = (imageId: string, newImageSrc: string) => {
    if (!fetchedHtml || !canvasRef.current) return fetchedHtml

    const canvas = canvasRef.current
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)

    let updatedHtml = fetchedHtml
    const imageToReplace = replaceableImages.find((img) => img.id === imageId)

    if (imageToReplace) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(updatedHtml, "text/html")
      const imgElements = doc.querySelectorAll("img")

      if (imgElements[Number.parseInt(imageId.split("-")[1])]) {
        imgElements[Number.parseInt(imageId.split("-")[1])].src = imageDataUrl
        updatedHtml = doc.documentElement.outerHTML
      }
    }

    return updatedHtml
  }

  const resizeImage = useCallback(
    (width: number, height: number) => {
      if (!canvasRef.current || !uploadedImage) return

      setExportSettings((prev) => ({ ...prev, width, height }))

      // Update canvas dimensions for preview
      const canvas = canvasRef.current
      canvas.width = width
      canvas.height = height

      applyAdjustments()
    },
    [uploadedImage, applyAdjustments],
  )

  const applyPremadeTemplate = useCallback(
    (template: (typeof premadeTemplates)[0]) => {
      // Save current state to undo stack
      setUndoStack((prev) => [...prev, { adjustments, textOverlays }])
      setRedoStack([])

      // Apply template settings
      setAdjustments(template.adjustments)
      setTextOverlays(template.textOverlays)
      setSelectedTemplate(template.id)

      // Resize canvas to template dimensions
      resizeImage(template.dimensions.width, template.dimensions.height)

      // Update analytics
      setAnalytics((prev) => ({
        ...prev,
        totalEdits: prev.totalEdits + 1,
        featuresUsed: [...new Set([...prev.featuresUsed, "premade-template"])],
      }))
    },
    [adjustments, textOverlays, resizeImage],
  )

  // Define updateImageInHtml function
  const updateImageInHtml = (imageId: string, imageDataUrl: string) => {
    setFetchedHtml((prevHtml) => {
      if (!prevHtml) return prevHtml

      const parser = new DOMParser()
      const doc = parser.parseFromString(prevHtml, "text/html")
      const imgElements = doc.querySelectorAll(`img[data-image-id="${imageId}"]`)

      imgElements.forEach((img) => {
        img.setAttribute("src", imageDataUrl)
      })

      return doc.documentElement.outerHTML
    })
  }

  // Batch processing functions
  const handleBatchFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith("image/"))

    const newBatchImages = imageFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      preview: "",
      processed: false
    }))

    // Generate previews
    newBatchImages.forEach((item) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        item.preview = e.target?.result as string
        setBatchImages(prev => [...prev])
      }
      reader.readAsDataURL(item.file)
    })

    setBatchImages(newBatchImages)
    setBatchMode(true)
  }, [])

  const processBatchImages = useCallback(async () => {
    if (batchImages.length === 0) return

    setBatchProgress(0)

    for (let i = 0; i < batchImages.length; i++) {
      const batchImage = batchImages[i]

      // Create a temporary canvas for processing
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) continue

      const img = new Image()
      await new Promise((resolve) => {
        img.onload = resolve
        img.src = batchImage.preview
      })

      tempCanvas.width = img.width
      tempCanvas.height = img.height

      // Apply current adjustments
      const filters = [
        `brightness(${100 + adjustments.brightness}%)`,
        `contrast(${100 + adjustments.contrast}%)`,
        `saturate(${100 + adjustments.saturation}%)`,
        `sepia(${Math.max(0, adjustments.warmth)}%) hue-rotate(${adjustments.warmth > 0 ? 10 : -10}deg)`,
      ].join(" ")

      tempCtx.filter = filters
      tempCtx.drawImage(img, 0, 0)

      // Apply text overlays
      textOverlays.forEach((overlay) => {
        tempCtx.font = `${overlay.weight} ${overlay.fontSize}px ${overlay.font}`
        tempCtx.fillStyle = overlay.color
        tempCtx.textAlign = "center"

        if (overlay.shadow) {
          tempCtx.shadowColor = "rgba(0,0,0,0.5)"
          tempCtx.shadowBlur = 4
          tempCtx.shadowOffsetX = 2
          tempCtx.shadowOffsetY = 2
        }

        tempCtx.fillText(overlay.text, overlay.x, overlay.y)

        if (overlay.shadow) {
          tempCtx.shadowColor = "transparent"
          tempCtx.shadowBlur = 0
          tempCtx.shadowOffsetX = 0
          tempCtx.shadowOffsetY = 0
        }
      })

      // Apply stickers
      stickers.forEach((sticker) => {
        tempCtx.font = `${sticker.size}px Arial`
        tempCtx.textAlign = "center"
        tempCtx.fillText(sticker.emoji, sticker.x, sticker.y)
      })

      // Save the processed image
      const processedDataUrl = tempCanvas.toDataURL("image/jpeg", 0.9)

      // Download the processed image
      const link = document.createElement("a")
      link.download = `modern-men-batch-${i + 1}.jpg`
      link.href = processedDataUrl
      link.click()

      // Mark as processed
      batchImage.processed = true
      setBatchProgress(((i + 1) / batchImages.length) * 100)
    }

    // Reset batch mode
    setTimeout(() => {
      setBatchMode(false)
      setBatchImages([])
      setBatchProgress(0)
    }, 1000)
  }, [batchImages, adjustments, textOverlays, stickers])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ... existing header code ... */}

      <header className="bg-black border-b border-red-600">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-black text-white">MODERN MEN</h1>
              <Badge variant="outline" className="text-xs border-red-600 text-red-600">
                IMAGE EDITOR
              </Badge>
              {collaborationMode && (
                <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                  COLLABORATIVE
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <span className="text-sm mr-2">📤</span>
                Upload Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const batchInput = document.getElementById('batch-file-input') as HTMLInputElement
                  batchInput?.click()
                }}
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                <span className="text-sm mr-2">📦</span>
                Batch Process
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCollaborationMode(!collaborationMode)}
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                {collaborationMode ? "Exit Collab" : "Collaborate"}
              </Button>
              {uploadedImage && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveImage("png")}
                    className="border-white text-white hover:bg-white hover:text-black"
                  >
                    <span className="text-sm mr-2">📥</span>
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveImage("jpeg")}
                    className="border-white text-white hover:bg-white hover:text-black"
                  >
                    <span className="text-sm mr-2">📥</span>
                    JPEG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveImage("webp")}
                    className="border-white text-white hover:bg-white hover:text-black"
                  >
                    <span className="text-sm mr-2">📥</span>
                    WebP
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg text-white">
                  <span className="flex items-center gap-2">🎨 Premade Templates</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplatePanel(!showTemplatePanel)}
                    className="text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    {showTemplatePanel ? "Hide" : "Show"}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showTemplatePanel && (
                <CardContent className="space-y-3">
                  <div className="flex gap-1 flex-wrap">
                    {["All", "Social Media", "Business", "Web", "Video", "E-commerce"].map((category) => (
                      <Button
                        key={category}
                        variant={selectedTemplateCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTemplateCategory(category)}
                        className={`text-xs ${
                          selectedTemplateCategory === category
                            ? "bg-red-600 text-white"
                            : "border-gray-600 text-white hover:bg-red-600"
                        }`}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {premadeTemplates
                      .filter(
                        (template) =>
                          selectedTemplateCategory === "All" || template.category === selectedTemplateCategory,
                      )
                      .map((template) => (
                        <div
                          key={template.id}
                          className={`p-2 border rounded cursor-pointer transition-all hover:border-red-600 ${
                            selectedTemplate === template.id ? "border-red-600 bg-red-600/10" : "border-gray-600"
                          }`}
                          onClick={() => applyPremadeTemplate(template)}
                        >
                          <div className="aspect-video bg-gray-800 rounded mb-2 flex items-center justify-center text-xs text-gray-400">
                            {template.dimensions.width}×{template.dimensions.height}
                          </div>
                          <p className="text-xs text-white font-medium truncate">{template.name}</p>
                          <p className="text-xs text-gray-400">{template.category}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <span className="text-red-600">👆</span>
                  Editing Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedTool === "select" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool("select")}
                    className={
                      selectedTool === "select"
                        ? "bg-red-600 text-white"
                        : "border-gray-600 text-white hover:bg-red-600"
                    }
                    disabled={!uploadedImage}
                  >
                    <span className="text-sm mr-1">👆</span>
                    Select
                  </Button>
                  <Button
                    variant={selectedTool === "crop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedTool("crop")
                      setCropMode(true)
                    }}
                    className={
                      selectedTool === "crop" ? "bg-red-600 text-white" : "border-gray-600 text-white hover:bg-red-600"
                    }
                    disabled={!uploadedImage}
                  >
                    ✂️ Crop
                  </Button>
                  <Button
                    variant={selectedTool === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool("text")}
                    className={
                      selectedTool === "text" ? "bg-red-600 text-white" : "border-gray-600 text-white hover:bg-red-600"
                    }
                    disabled={!uploadedImage}
                  >
                    <span className="text-sm mr-1">📝</span>
                    Text
                  </Button>
                  <Button
                    variant={selectedTool === "sticker" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedTool("sticker")
                      setShowStickerPanel(true)
                    }}
                    className={
                      selectedTool === "sticker"
                        ? "bg-red-600 text-white"
                        : "border-gray-600 text-white hover:bg-red-600"
                    }
                    disabled={!uploadedImage}
                  >
                    😀 Stickers
                  </Button>
                </div>

                {selectedTool === "crop" && (
                  <div className="pt-2 border-t border-gray-600 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { label: "Free", value: "free" },
                          { label: "1:1", value: "1:1" },
                          { label: "16:9", value: "16:9" },
                          { label: "4:3", value: "4:3" },
                        ].map((ratio) => (
                          <Button
                            key={ratio.value}
                            variant={cropAspectRatio === ratio.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCropAspectRatio(ratio.value)}
                            className={`text-xs ${
                              cropAspectRatio === ratio.value
                                ? "bg-red-600 text-white"
                                : "border-gray-600 text-white hover:bg-red-600"
                            }`}
                          >
                            {ratio.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {cropArea.width > 0 && cropArea.height > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-300">
                          Crop Area: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
                        </div>
                        <Button
                          onClick={applyCrop}
                          size="sm"
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                          <span className="text-sm mr-2">✂️</span>
                          Apply Crop
                        </Button>
                        <Button
                          onClick={() => {
                            setCropArea({ x: 0, y: 0, width: 0, height: 0 })
                            setCropMode(false)
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full border-gray-600 text-white hover:bg-gray-800"
                        >
                          Cancel Crop
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-gray-600">
                  <input
                    type="checkbox"
                    id="realtime"
                    checked={realTimePreview}
                    onChange={(e) => setRealTimePreview(e.target.checked)}
                    className="rounded border-gray-600"
                  />
                  <label htmlFor="realtime" className="text-sm text-white">
                    Real-time preview
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <span className="text-red-600">⚙️</span>
                  Quick Adjustments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">Quick Resize</label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: "Instagram", width: 1080, height: 1080 },
                      { label: "Facebook", width: 1200, height: 630 },
                      { label: "YouTube", width: 1280, height: 720 },
                      { label: "Custom", width: exportSettings.width, height: exportSettings.height },
                    ].map((size) => (
                      <Button
                        key={size.label}
                        variant="outline"
                        size="sm"
                        onClick={() => resizeImage(size.width, size.height)}
                        className="text-xs border-gray-600 text-white hover:bg-red-600"
                        disabled={!uploadedImage}
                      >
                        {size.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-white flex items-center justify-between">
                    Brightness
                    <span className="text-xs text-red-600">
                      {adjustments.brightness > 0 ? "+" : ""}
                      {adjustments.brightness}
                    </span>
                  </label>
                  <Slider
                    value={[adjustments.brightness]}
                    onValueChange={([value]: [number]) => {
                      setAdjustments((prev) => ({ ...prev, brightness: value }))
                      if (realTimePreview) {
                        setTimeout(applyAdjustments, 100)
                      }
                    }}
                    min={-50}
                    max={50}
                    step={1}
                    disabled={!uploadedImage}
                    className="[&_[role=slider]]:bg-red-600 [&_[role=slider]]:border-red-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-white flex items-center justify-between">
                    Contrast
                    <span className="text-xs text-red-600">
                      {adjustments.contrast > 0 ? "+" : ""}
                      {adjustments.contrast}
                    </span>
                  </label>
                  <Slider
                    value={[adjustments.contrast]}
                    onValueChange={([value]: [number]) => {
                      setAdjustments((prev) => ({ ...prev, contrast: value }))
                      if (realTimePreview) {
                        setTimeout(applyAdjustments, 100)
                      }
                    }}
                    min={-50}
                    max={50}
                    step={1}
                    disabled={!uploadedImage}
                    className="[&_[role=slider]]:bg-red-600 [&_[role=slider]]:border-red-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-white flex items-center justify-between">
                    Saturation
                    <span className="text-xs text-red-600">
                      {adjustments.saturation > 0 ? "+" : ""}
                      {adjustments.saturation}
                    </span>
                  </label>
                  <Slider
                    value={[adjustments.saturation]}
                    onValueChange={([value]: [number]) => {
                      setAdjustments((prev) => ({ ...prev, saturation: value }))
                      if (realTimePreview) {
                        setTimeout(applyAdjustments, 100)
                      }
                    }}
                    min={-50}
                    max={50}
                    step={1}
                    disabled={!uploadedImage}
                    className="[&_[role=slider]]:bg-red-600 [&_[role=slider]]:border-red-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-white flex items-center justify-between">
                    Upscale Quality
                    <span className="text-xs text-red-600">{adjustments.scale}x</span>
                  </label>
                  <Slider
                    value={[adjustments.scale]}
                    onValueChange={([value]: [number]) => {
                      setAdjustments((prev) => ({ ...prev, scale: value }))
                      if (realTimePreview) {
                        setTimeout(applyAdjustments, 100)
                      }
                    }}
                    min={1}
                    max={4}
                    step={0.5}
                    disabled={!uploadedImage}
                    className="[&_[role=slider]]:bg-red-600 [&_[role=slider]]:border-red-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1x</span>
                    <span>2x</span>
                    <span>3x</span>
                    <span>4x</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setAdjustments({
                      brightness: 0,
                      contrast: 0,
                      saturation: 0,
                      warmth: 0,
                      vignette: 0,
                      scale: 1,
                    })
                    setTextOverlays([])
                    setStickers([])
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-600 text-white hover:bg-red-600 hover:border-red-600"
                  disabled={!uploadedImage}
                >
                  <span className="text-sm mr-2">↻</span>
                  Reset All
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <span className="text-red-600">🎨</span>
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {advancedFilters.map((filter) => (
                    <Button
                      key={filter.name}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent border-gray-600 text-white hover:bg-red-600 hover:border-red-600"
                      onClick={() => {
                        setAdjustments({
                          brightness: filter.brightness,
                          contrast: filter.contrast,
                          saturation: filter.saturation,
                          warmth: filter.warmth,
                          vignette: filter.vignette,
                          scale: 1,
                        })
                        if (realTimePreview) {
                          setTimeout(applyAdjustments, 100)
                        }
                      }}
                      disabled={!uploadedImage}
                    >
                      {filter.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ... existing code for other cards ... */}

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <span className="text-red-600">📝</span>
                  Text & Stickers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTool === "text" && (
                  <div className="space-y-3 p-3 bg-gray-800 rounded border border-red-600">
                    <h4 className="text-sm font-medium text-red-600">Text Tool Active</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {textPresets.map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs bg-transparent border-gray-600 text-white hover:bg-red-600 hover:border-red-600"
                          onClick={() => addTextOverlay(preset)}
                          disabled={!uploadedImage}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent border-gray-600 text-white hover:bg-red-600 hover:border-red-600"
                      onClick={() => addTextOverlay()}
                      disabled={!uploadedImage}
                    >
                      <span className="text-sm mr-2">📝</span>
                      Add Custom Text
                    </Button>
                  </div>
                )}

                {textOverlays.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Text Layers</h4>
                    {textOverlays.map((overlay, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600"
                      >
                        <span className="text-xs truncate text-white">{overlay.text}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => {
                            setTextOverlays(textOverlays.filter((_, i) => i !== index))
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sticker Panel */}
                {selectedTool === "sticker" && (
                  <div className="space-y-3 p-3 bg-gray-800 rounded border border-red-600">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-red-600">😀 Sticker Library</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStickerPanel(!showStickerPanel)}
                        className="text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        {showStickerPanel ? "Hide" : "Show"}
                      </Button>
                    </div>

                    {showStickerPanel && (
                      <div className="space-y-3">
                        {/* Category Tabs */}
                        <div className="flex gap-1 flex-wrap">
                          {stickerCategories.map((category) => (
                            <Button
                              key={category.name}
                              variant={selectedStickerCategory === category.name ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedStickerCategory(category.name)}
                              className={`text-xs ${
                                selectedStickerCategory === category.name
                                  ? "bg-red-600 text-white"
                                  : "border-gray-600 text-white hover:bg-red-600"
                              }`}
                            >
                              {category.name}
                            </Button>
                          ))}
                        </div>

                        {/* Sticker Grid */}
                        <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                          {(() => {
                            const category = stickerCategories.find(cat => cat.name === selectedStickerCategory)
                            if (!category) return null

                            return stickerLibrary
                              .slice(category.start, category.end + 1)
                              .map((emoji, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0 border-gray-600 text-xl hover:bg-red-600 hover:border-red-600"
                                  onClick={() => addSticker(emoji)}
                                  disabled={!uploadedImage}
                                >
                                  {emoji}
                                </Button>
                              ))
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sticker Layers */}
                {stickers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Sticker Layers</h4>
                    {stickers.map((sticker, index) => (
                      <div
                        key={sticker.id}
                        className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600"
                      >
                        <span className="text-lg">{sticker.emoji}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-600 hover:text-white"
                          onClick={() => {
                            setStickers(stickers.filter((_, i) => i !== index))
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <span className="text-red-600">📤</span>
                  Export Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Format</Label>
                  <Select
                    value={exportSettings.format}
                    onValueChange={(value: any) => setExportSettings(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="png">PNG (Lossless)</SelectItem>
                      <SelectItem value="jpeg">JPEG (Smaller)</SelectItem>
                      <SelectItem value="webp">WebP (Modern)</SelectItem>
                      <SelectItem value="avif">AVIF (Best Compression)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Quality: {exportSettings.quality}%</Label>
                  <Slider
                    value={[exportSettings.quality]}
                    onValueChange={(value: number[]) => setExportSettings(prev => ({ ...prev, quality: value[0] }))}
                    min={1}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-white mb-1 block text-sm">Width</Label>
                    <Input
                      type="number"
                      value={exportSettings.width}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 1920 }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white mb-1 block text-sm">Height</Label>
                    <Input
                      type="number"
                      value={exportSettings.height}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 1080 }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="watermark"
                      checked={exportSettings.watermark}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, watermark: e.target.checked }))}
                      className="rounded border-gray-600"
                    />
                    <Label htmlFor="watermark" className="text-white">Add Watermark</Label>
                  </div>

                  {exportSettings.watermark && (
                    <div className="space-y-2 ml-6">
                      <Input
                        placeholder="Watermark text"
                        value={exportSettings.watermarkText}
                        onChange={(e) => setExportSettings(prev => ({ ...prev, watermarkText: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      <Select
                        value={exportSettings.watermarkPosition}
                        onValueChange={(value: any) => setExportSettings(prev => ({ ...prev, watermarkPosition: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                        </SelectContent>
                      </Select>
                      <div>
                        <Label className="text-white mb-1 block text-sm">Opacity: {Math.round(exportSettings.watermarkOpacity * 100)}%</Label>
                        <Slider
                          value={[exportSettings.watermarkOpacity]}
                          onValueChange={(value: number[]) => setExportSettings(prev => ({ ...prev, watermarkOpacity: value[0] }))}
                          min={0.1}
                          max={1}
                          step={0.1}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-white mb-2 block">Color Profile</Label>
                  <Select
                    value={exportSettings.colorProfile}
                    onValueChange={(value: any) => setExportSettings(prev => ({ ...prev, colorProfile: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="srgb">sRGB (Web Standard)</SelectItem>
                      <SelectItem value="adobe-rgb">Adobe RGB (Print)</SelectItem>
                      <SelectItem value="prophoto-rgb">ProPhoto RGB (Photography)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="progressive"
                    checked={exportSettings.progressive}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, progressive: e.target.checked }))}
                    className="rounded border-gray-600"
                  />
                  <Label htmlFor="progressive" className="text-white">Progressive rendering</Label>
                </div>

                <Button
                  onClick={exportWithSettings}
                  disabled={!uploadedImage}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <span className="text-sm mr-2">📤</span>
                  Export Image
                </Button>
              </CardContent>
            </Card>

            {/* ... existing code for remaining cards ... */}
          </div>

          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-white">
                    <span className="text-red-600">👁️</span>
                    Image Editor
                    {selectedTool !== "select" && (
                      <Badge variant="secondary" className="text-xs bg-red-600 text-white ml-2">
                        {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Tool Active
                      </Badge>
                    )}
                  </span>
                  {uploadedImage && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-red-600 text-white">
                        {adjustments.scale > 1 ? `Upscaled ${adjustments.scale}x` : "Original Size"}
                      </Badge>
                      {realTimePreview && (
                        <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                          Live Preview
                        </Badge>
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!uploadedImage ? (
                  <div
                    className="border-2 border-dashed border-red-600 rounded-lg p-12 text-center cursor-pointer hover:border-red-500 transition-colors bg-gray-800"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-4xl text-red-600 mx-auto mb-4">📤</span>
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Your Image</h3>
                    <p className="text-gray-300 mb-4">Drag and drop an image here, or click to select a file</p>
                    <p className="text-sm text-gray-400">Supports PNG, JPEG, and WebP formats</p>
                    <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="text-center">
                        <div className="text-2xl mb-2">✂️</div>
                        <p className="text-xs text-gray-400">Crop & Resize</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎨</div>
                        <p className="text-xs text-gray-400">Filters & Effects</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">📝</div>
                        <p className="text-xs text-gray-400">Text Overlays</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">😀</div>
                        <p className="text-xs text-gray-400">Stickers & Emojis</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {selectedTool === "crop" && (
                      <div className="mb-4 p-3 bg-red-600/10 border border-red-600 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">✂️ Crop Tool Active</p>
                        <p className="text-xs text-gray-300">Click and drag on the image to select the area to crop</p>
                      </div>
                    )}
                    {selectedTool === "text" && (
                      <div className="mb-4 p-3 bg-red-600/10 border border-red-600 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">📝 Text Tool Active</p>
                        <p className="text-xs text-gray-300">
                          Click on the image to add text, or use the presets in the sidebar
                        </p>
                      </div>
                    )}
                    {selectedTool === "sticker" && (
                      <div className="mb-4 p-3 bg-red-600/10 border border-red-600 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">😀 Sticker Tool Active</p>
                        <p className="text-xs text-gray-300">Select a sticker from the panel to add it to your image</p>
                      </div>
                    )}

                    <div className="flex justify-center relative">
                      <canvas
                        ref={canvasRef}
                        className={`max-w-full max-h-[600px] border rounded-lg shadow-sm ${
                          cropMode ? 'cursor-crosshair' : 'cursor-pointer'
                        }`}
                        style={{ objectFit: "contain" }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                        onClick={(e) => {
                          if (selectedTool === "text" && !cropMode) {
                            const rect = canvasRef.current?.getBoundingClientRect()
                            if (rect) {
                              const x = e.clientX - rect.left
                              const y = e.clientY - rect.top
                              addTextOverlay()
                            }
                          }
                        }}
                      />

                      {/* Crop overlay */}
                      {cropMode && cropArea.width > 0 && cropArea.height > 0 && (
                        <>
                          {/* Dark overlay */}
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Top */}
                            <div
                              className="absolute bg-black bg-opacity-50"
                              style={{
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${cropArea.y}px`
                              }}
                            />
                            {/* Bottom */}
                            <div
                              className="absolute bg-black bg-opacity-50"
                              style={{
                                top: `${cropArea.y + cropArea.height}px`,
                                left: 0,
                                width: '100%',
                                height: `${canvasRef.current ? canvasRef.current.height - (cropArea.y + cropArea.height) : 0}px`
                              }}
                            />
                            {/* Left */}
                            <div
                              className="absolute bg-black bg-opacity-50"
                              style={{
                                top: `${cropArea.y}px`,
                                left: 0,
                                width: `${cropArea.x}px`,
                                height: `${cropArea.height}px`
                              }}
                            />
                            {/* Right */}
                            <div
                              className="absolute bg-black bg-opacity-50"
                              style={{
                                top: `${cropArea.y}px`,
                                left: `${cropArea.x + cropArea.width}px`,
                                width: `${canvasRef.current ? canvasRef.current.width - (cropArea.x + cropArea.width) : 0}px`,
                                height: `${cropArea.height}px`
                              }}
                            />
                          </div>

                          {/* Crop border */}
                          <div
                            className="absolute border-2 border-white pointer-events-none"
                            style={{
                              left: `${cropArea.x}px`,
                              top: `${cropArea.y}px`,
                              width: `${cropArea.width}px`,
                              height: `${cropArea.height}px`
                            }}
                          >
                            {/* Resize handles */}
                            {Object.entries(getCropHandles()).map(([handle, pos]) => (
                              <div
                                key={handle}
                                className="absolute w-3 h-3 bg-white border border-red-600 rounded-full -translate-x-1.5 -translate-y-1.5 pointer-events-none"
                                style={{
                                  left: `${pos.x}px`,
                                  top: `${pos.y}px`,
                                  cursor: handle.includes('n') || handle.includes('s')
                                    ? handle.includes('w') || handle.includes('e')
                                      ? 'nw-resize' : 'ns-resize'
                                    : 'ew-resize'
                                }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <Image
                      ref={imageRef}
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded"
                      width={800}
                      height={600}
                      className="hidden"
                      onLoad={applyAdjustments}
                    />

                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTool("select")}
                        className={`${selectedTool === "select" ? "bg-red-600 text-white" : "bg-black/50 border-gray-600 text-white hover:bg-red-600"}`}
                      >
                        <span className="text-sm">👆</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTool("crop")
                          setCropMode(true)
                        }}
                        className={`${selectedTool === "crop" ? "bg-red-600 text-white" : "bg-black/50 border-gray-600 text-white hover:bg-red-600"}`}
                      >
                        ✂️
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTool("text")}
                        className={`${selectedTool === "text" ? "bg-red-600 text-white" : "bg-black/50 border-gray-600 text-white hover:bg-red-600"}`}
                      >
                        <span className="text-sm">📝</span>
                      </Button>
                    </div>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <input
                  id="batch-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBatchFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* ... existing code for export options ... */}
          </div>
        </div>
      </div>

      {isInlineEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Image</h2>
                <div className="flex gap-2">
                  <Button onClick={applyEditedImageToHtml} className="bg-red-600 hover:bg-red-700 text-white">
                    Apply Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setIsInlineEditing(false)
                      setEditingImageId(null)
                      setEditingImageSrc("")
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Editing Tools */}
                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Adjustments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Brightness</Label>
                        <Slider
                          value={[brightness]}
                          onValueChange={(value: number[]) => setBrightness(value[0])}
                          min={-100}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Contrast</Label>
                        <Slider
                          value={[contrast]}
                          onValueChange={(value: number[]) => setContrast(value[0])}
                          min={-100}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Saturation</Label>
                        <Slider
                          value={[saturation]}
                          onValueChange={(value: number[]) => setSaturation(value[0])}
                          min={-100}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "None", value: "none" },
                          { name: "Vintage", value: "vintage" },
                          { name: "B&W", value: "blackwhite" },
                          { name: "Sepia", value: "sepia" },
                          { name: "Warm", value: "warm" },
                          { name: "Cool", value: "cool" },
                        ].map((filter) => (
                          <Button
                            key={filter.value}
                            onClick={() => setColorTint(filter.value as any)}
                            variant={colorTint === filter.value ? "default" : "outline"}
                            className={`text-xs ${
                              colorTint === filter.value
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "border-gray-600 text-gray-300 hover:bg-gray-800"
                            }`}
                          >
                            {filter.name}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Center Panel - Image Preview */}
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                        <canvas ref={canvasRef} className="max-w-full h-auto" style={{ maxHeight: "400px" }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {batchMode && batchImages.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Batch Processing</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {batchImages.filter(img => img.processed).length} / {batchImages.length} processed
              </div>
              <Button
                onClick={processBatchImages}
                disabled={batchProgress > 0}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {batchProgress > 0 ? `Processing... ${Math.round(batchProgress)}%` : "Process All Images"}
              </Button>
              <Button
                onClick={() => {
                  setBatchMode(false)
                  setBatchImages([])
                  setBatchProgress(0)
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {batchImages.map((batchImage) => (
                  <div key={batchImage.id} className="relative">
                    <Image
                      src={batchImage.preview || "/placeholder.svg"}
                      alt="Batch image"
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg border border-gray-600"
                    />
                    {batchImage.processed && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        ✓ Processed
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-400 truncate">
                      {batchImage.file.name}
                    </div>
                  </div>
                ))}
              </div>

              {batchProgress > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Processing Progress</span>
                    <span className="text-sm text-gray-400">{Math.round(batchProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${batchProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Live Page Preview</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">Click any image to edit it directly</div>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="home">Homepage</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="about">About</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  const pageUrls = {
                    home: "https://modernmen.vercel.app/",
                    services: "https://modernmen.vercel.app/services",
                    about: "https://modernmen.vercel.app/about",
                    contact: "https://modernmen.vercel.app/contact",
                  }
                  fetchPageHtml(pageUrls[selectedPage as keyof typeof pageUrls])
                }}
                disabled={isLoadingHtml}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoadingHtml ? "Loading..." : "Fetch Live HTML"}
              </Button>
            </div>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <div className="bg-white rounded-lg overflow-hidden">
                {fetchedHtml ? (
                  <iframe srcDoc={fetchedHtml} className="w-full h-[600px] border-0" title="Live Page Preview" />
                ) : (
                  <div className="h-[600px] flex items-center justify-center text-gray-500">
                    Click "Fetch Live HTML" to load the page for editing
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
