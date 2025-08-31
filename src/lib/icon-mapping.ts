// Use placeholder icons system to avoid lucide-react import issues
import React from 'react'
import type { ComponentType } from 'react'

// Placeholder component used for all icons
const Placeholder: React.FC<any> = (props) => null

// Import all icons from our placeholder system
import * as Icons from './icons'

/**
 * The default fallback icon component.
 */
const FallbackIcon: ComponentType<any> = Placeholder

/**
 * Map of available lucide-react icons.
 * Only add icons that are actually imported and available.
 */
const lucideIcons: Record<string, ComponentType<any>> = {
    settings: Icons.Settings,
    shield: Icons.Shield,
    database: Icons.Database,
    bell: Icons.Bell,
    alertTriangle: Icons.AlertTriangle,
    checkCircle: Icons.CheckCircle,
    code: Icons.Code,
    search: Icons.Search,
    book: Icons.BookOpen,
    arrowLeft: Icons.ArrowLeft,
    chevronRight: Icons.ChevronRight,
    menu: Icons.Menu,
    x: Icons.X,
    users: Icons.Users,
    helpCircle: Icons.HelpCircle,
    calendar: Icons.Calendar,
    fileText: Icons.FileText,
    barChart3: Icons.BarChart3,
    trendingUp: Icons.TrendingUp,
    clock: Icons.Clock,
    refreshCw: Icons.RefreshCw,
    eye: Icons.Eye,
    messageSquare: Icons.MessageSquare,
    star: Icons.Star,
    thumbsUp: FallbackIcon, // Use fallback as ThumbsUp is not available
    filter: Icons.Filter,
    loader2: Icons.Loader2,
    copy: Icons.Copy,
    download: Icons.Download,
    play: Icons.Play,
    chevronDown: Icons.ChevronDown,
    externalLink: Icons.ExternalLink,
    zap: Icons.Zap,
    phone: Icons.Phone,
    mapPin: Icons.MapPin,
    scissors: FallbackIcon, // Use fallback as Scissors is not available
    brush: FallbackIcon, // Use fallback as Brush is not available
    award: Icons.Award,
    arrowRight: Icons.ArrowRight,
    wifiOff: Icons.WifiOff,
    home: Icons.Home,
    messageCircle: FallbackIcon, // Use fallback as MessageCircle is not available
    bookOpen: Icons.BookOpen,
    facebook: FallbackIcon, // Use fallback as Facebook is not available
    instagram: FallbackIcon, // Use fallback as Instagram is not available
    twitter: FallbackIcon, // Use fallback as Twitter is not available
    eyeOff: Icons.EyeOff,
    sliders: FallbackIcon, // Use fallback as Sliders is not available
    circle: FallbackIcon, // Use fallback as Circle is not available
    type: FallbackIcon, // Use fallback as Type is not available
    mousePointer: FallbackIcon, // Use fallback as MousePointer is not available
    rotateCw: Icons.RotateCcw,
    palette: FallbackIcon, // Use fallback as Palette is not available
    navigation: FallbackIcon, // Use fallback as Navigation is not available
    volume2: Icons.Volume2,
    volumeX: Icons.VolumeX,
    pause: Icons.Pause,
    target: FallbackIcon, // Use fallback as Target is not available
    grid: Icons.Grid,
    list: FallbackIcon, // Use fallback as List is not available
    layout: FallbackIcon, // Use fallback as Layout is not available
    maximize: FallbackIcon, // Use fallback as Maximize is not available
    minimize: FallbackIcon, // Use fallback as Minimize is not available
    moreHorizontal: Icons.MoreHorizontal,
    moreVertical: Icons.MoreVertical,
    unlock: Icons.Unlock,
    heart: Icons.Heart,
    flag: Icons.Flag,
    tag: Icons.Tag,
    bookmark: FallbackIcon, // Use fallback as Bookmark is not available
    gift: FallbackIcon, // Use fallback as Gift is not available
    sparkles: Icons.Sparkles,
    gitCommit: Icons.GitCommit,
    component: FallbackIcon, // Use fallback as Component is not available
    lineChart: FallbackIcon, // Use fallback as LineChart is not available
    trendingDown: Icons.TrendingDown,
    activity: Icons.Activity,
    logOut: Icons.LogOut,
    camera: Icons.Camera,
    barChart: Icons.BarChart3, // Alias for BarChart
    BarChart: Icons.BarChart3, // Capitalized version
    Headphones: Icons.HelpCircle, // Use HelpCircle as fallback
    // Add more icons as needed
    chart: FallbackIcon, // Use fallback as Chart is not available
}

/**
 * Enhanced icon mapping utilities for the Modern Men platform.
 * Provides a robust, type-safe, and extensible way to retrieve icon components by name,
 * including support for aliases and fallbacks.
 */

/**
 * Main icon mapping object.
 * Maps string keys (icon names and aliases) to icon components.
 * All aliases and alternate names are mapped to the closest available icon.
 */
export const iconMapping: Record<string, ComponentType<any>> = {
  // Direct mappings for available icons
  settings: Icons.Settings,
  shield: Icons.Shield,
  database: Icons.Database,
  bell: Icons.Bell,
  alertTriangle: Icons.AlertTriangle,
  checkCircle: Icons.CheckCircle,
  code: Icons.Code,
  book: Icons.BookOpen,
  arrowLeft: Icons.ArrowLeft,
  chevronRight: Icons.ChevronRight,
  menu: Icons.Menu,
  x: Icons.X,
  users: Icons.Users,
  helpCircle: Icons.HelpCircle,
  calendar: Icons.Calendar,
  fileText: Icons.FileText,
  barChart3: Icons.BarChart3,
  trendingUp: Icons.TrendingUp,
  clock: Icons.Clock,
  refreshCw: Icons.RefreshCw,
  eye: Icons.Eye,
  messageSquare: Icons.MessageSquare,
  star: Icons.Star,
  thumbsUp: FallbackIcon, // Use fallback as ThumbsUp is not available
  filter: Icons.Filter,
  loader2: Icons.Loader2,
  copy: Icons.Copy,
  download: Icons.Download,
  play: Icons.Play,
  chevronDown: Icons.ChevronDown,
  externalLink: Icons.ExternalLink,
  zap: Icons.Zap,
  phone: Icons.Phone,
  mapPin: Icons.MapPin,
  scissors: FallbackIcon, // Use fallback as Scissors is not available
  brush: FallbackIcon, // Use fallback as Brush is not available
  award: Icons.Award,
  arrowRight: Icons.ArrowRight,
  wifiOff: Icons.WifiOff,
  home: Icons.Home,
  messageCircle: FallbackIcon, // Use fallback as MessageCircle is not available
  bookOpen: Icons.BookOpen,
  facebook: FallbackIcon, // Use fallback as Facebook is not available
  instagram: FallbackIcon, // Use fallback as Instagram is not available
  twitter: FallbackIcon, // Use fallback as Twitter is not available
  eyeOff: Icons.EyeOff,
  sliders: FallbackIcon, // Use fallback as Sliders is not available
  circle: FallbackIcon, // Use fallback as Circle is not available
  type: FallbackIcon, // Use fallback as Type is not available
  mousePointer: FallbackIcon, // Use fallback as MousePointer is not available
  rotateCw: Icons.RotateCcw,
  palette: FallbackIcon, // Use fallback as Palette is not available
  navigation: FallbackIcon, // Use fallback as Navigation is not available
  volume2: Icons.Volume2,
  volumeX: Icons.VolumeX,
  pause: Icons.Pause,
  target: FallbackIcon, // Use fallback as Target is not available
  grid: Icons.Grid,
  list: FallbackIcon, // Use fallback as List is not available
  layout: FallbackIcon, // Use fallback as Layout is not available
  maximize: FallbackIcon, // Use fallback as Maximize is not available
  minimize: FallbackIcon, // Use fallback as Minimize is not available
  moreHorizontal: Icons.MoreHorizontal,
  moreVertical: Icons.MoreVertical,
  unlock: Icons.Unlock,
  heart: Icons.Heart,
  flag: Icons.Flag,
  tag: Icons.Tag,
  bookmark: FallbackIcon, // Use fallback as Bookmark is not available
  gift: FallbackIcon, // Use fallback as Gift is not available
  sparkles: Icons.Sparkles,
  gitCommit: Icons.GitCommit,
  component: FallbackIcon, // Use fallback as Component is not available
  lineChart: FallbackIcon, // Use fallback as LineChart is not available
  trendingDown: Icons.TrendingDown,
  activity: Icons.Activity,
  logOut: Icons.LogOut,
  camera: Icons.Camera,
  chart: FallbackIcon, // Use fallback as Chart is not available

  // Fallback/alias mappings for missing or alternate icon names
  globe: Icons.Database,
  mail: Icons.Bell,
  key: FallbackIcon, // 'lock' does not exist, fallback to Settings
  server: Icons.Database,
  info: Icons.HelpCircle,
  alertCircle: Icons.AlertTriangle,
  infoIcon: Icons.HelpCircle,
  checkCircle2: Icons.CheckCircle,
  rotateCcw: Icons.RefreshCw,
  saveIcon: Icons.Download,
  historyIcon: Icons.Clock,
  alertCircleIcon: Icons.AlertTriangle,
  checkCircleIcon: Icons.CheckCircle,
  wifi: Icons.WifiOff,
  paintbrush: FallbackIcon, // Use fallback as Brush is not available
  loader: Icons.Loader2,
  terminal: Icons.Code,
  accessibility: Icons.HelpCircle,
  gitBranch: Icons.GitCommit,
  thumbsDown: FallbackIcon, // Use fallback as ThumbsUp is not available
  link: Icons.ExternalLink,
  barChart: Icons.BarChart3,
  xCircle: Icons.X,
  upload: Icons.Upload,
  monitor: Icons.Phone, // Alias for phone, as 'monitor' is not directly available in lucideIcons
  smartphone: Icons.Phone,
  stop: Icons.Pause, // Use pause as fallback for stop
  edit: Icons.Edit,
  save: Icons.Download,
}

/**
 * Returns the icon component for a given icon name, or the fallback.
 * @param iconName - The icon name to retrieve.
 * @returns The icon component.
 */
export function getIcon(iconName: string): ComponentType<any> {
  return iconMapping[iconName] || FallbackIcon
}

// Re-export all icons from the icons module for direct import if needed
export * from './icons'

// Direct exports for commonly used capitalized icon names
export const Award = Icons.Award
export const Scissors = FallbackIcon // Use fallback as Scissors is not available
export const Zap = Icons.Zap
export const Brush = FallbackIcon // Use fallback as Brush is not available
export const Star = Icons.Star
export const Facebook = FallbackIcon // Use fallback as Facebook is not available
export const Instagram = FallbackIcon // Use fallback as Instagram is not available
export const Mail = Icons.Bell
export const Search = Icons.Search
export const LogOut = Icons.LogOut
export const Camera = Icons.Camera
export const Book = Icons.BookOpen
export const Chart = FallbackIcon // Use fallback as Chart is not available
export const BarChart = Icons.BarChart3
export const Headphones = Icons.HelpCircle
export const List = FallbackIcon

// Additional exports for the booking system
export const Calendar = Icons.Calendar
export const Clock = Icons.Clock
export const User = Icons.Users
export const CheckCircle = Icons.CheckCircle
export const MapPin = Icons.MapPin
export const Phone = Icons.Phone
export const MessageCircle = FallbackIcon // Use fallback as MessageCircle is not available
export const Send = Icons.ArrowRight
export const Loader2 = Icons.Loader2
export const Filter = Icons.Filter
export const Package = Icons.Package
export const DollarSign = Icons.DollarSign
export const Activity = Icons.Activity
export const RefreshCw = Icons.RefreshCw
export const AlertCircle = Icons.AlertTriangle
export const FileX = Icons.File // Use File as fallback for FileX
export const Bookmark = FallbackIcon // Use fallback as Bookmark is not available
export const Share = Icons.Share
export const Printer = Icons.Printer
export const Tag = Icons.Tag
export const Eye = Icons.Eye
export const History = Icons.History
export const Image = Icons.Image
