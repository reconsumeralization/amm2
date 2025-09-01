// Icon mapping system for consistent icon usage across the app
import * as React from 'react'

// Import available icons from lucide-react (v0.542.0)
import {
  X,
  Calendar,
  Clock,
  Eye,
  Star,
  Filter,
  Loader,
  Copy,
  Download,
  Play,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Zap,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Home,
  EyeOff,
  RotateCcw,
  Volume2,
  VolumeX,
  Pause,
  MoreHorizontal,
  MoreVertical,
  Lock,
  Unlock,
  Heart,
  Flag,
  Tag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Activity,
  LogOut,
  Camera,
  Package,
  Gift,
  DollarSign,
  Edit,
  Trash2,
  Share,
  Printer,
  History,
  AlertCircle,
  AlertTriangle,
  Plus,
  File,
  FileText,
  MessageCircle,
  MessageSquare,
  Send,
  LineChart,
  Check,
  CheckCircle,
  User,
  Users,
  Search,
  Settings,
  Shield,
  Bell,
  Menu,
  Award,
  Calculator,
  CreditCard,
  Globe,
  Layers,
  Layout,
  Minus,
  Monitor,
  MousePointer,
  Palette,
  Scissors,
  Smartphone,
  Tablet,
  Trophy,
  Type,
  AlignLeft,
  BarChart3,
  BookOpen,
  Code,
  Grid3X3,
  Mail,
  RefreshCw
}
  Database,
  Minus,
  CreditCard,
  Type,
  AlignLeft,
  MousePointer,
  Layout,
  Trophy,
  Scissors,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  Layers,
  Palette,
  Calculator,
  Grid3X3,
  Award
} from 'lucide-react'

// Icon mapping object for centralized access
export const iconMap = {
  // Navigation
  menu: Menu,
  x: X,
  home: Home,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  externalLink: ExternalLink,

  // User & Auth
  user: User,
  users: Users,
  settings: Settings,
  shield: Shield,
  unlock: Unlock,
  logOut: LogOut,

  // Communication
  mail: Mail,
  messageCircle: MessageCircle,
  messageSquare: MessageSquare,
  send: Send,
  phone: Phone,
  bell: Bell,

  // Files & Media
  file: File,
  fileText: FileText,
  camera: Camera,
  eye: Eye,
  eyeOff: EyeOff,
  download: Download,
  copy: Copy,
  share: Share,
  printer: Printer,

  // Actions
  edit: Edit,
  trash2: Trash2,
  database: Database,
  search: Search,
  filter: Filter,
  play: Play,
  pause: Pause,
  plus: Plus,
  check: Check,
  refreshCw: RefreshCw,
  rotateCcw: RotateCcw,
  loader: Loader,

  // Status & Alerts
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  checkCircle: CheckCircle,
  star: Star,
  heart: Heart,

  // Charts & Analytics
  barChart3: BarChart3,
  lineChart: LineChart,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  activity: Activity,

  // Time & Calendar
  calendar: Calendar,
  clock: Clock,
  history: History,

  // Location & Commerce
  mapPin: MapPin,
  package: Package,
  gift: Gift,
  dollarSign: DollarSign,

  // Development
  code: Code,
  bookOpen: BookOpen,

  // Layout & UI
  grid: Grid3X3,
  moreHorizontal: MoreHorizontal,
  moreVertical: MoreVertical,
  zap: Zap,

  // Additional available icons
  award: Award,
  calculator: Calculator,
  creditCard: CreditCard,
  globe: Globe,
  layers: Layers,
  layout: Layout,
  minus: Minus,
  monitor: Monitor,
  mousePointer: MousePointer,
  palette: Palette,
  scissors: Scissors,
  smartphone: Smartphone,
  tablet: Tablet,
  trophy: Trophy,
  type: Type,
  alignLeft: AlignLeft
}

// Export icons individually to avoid webpack issues
export { Menu }
export { X }
export { Home }
export { ArrowLeft }
export { ArrowRight }
export { ChevronDown }
export { ChevronRight }
export { ExternalLink }
export { User }
export { Users }
export { Settings }
export { Shield }
export { Unlock }
export { LogOut }
export { Mail }
export { MessageCircle }
export { MessageSquare }
export { Send }
export { Phone }
export { Bell }
export { File }
export { FileText }
export { Camera }
export { Eye }
export { EyeOff }
export { Download }
export { Copy }
export { Share }
export { Printer }
export { Edit }
export { Trash2 }
export { Database }
export { Search }
export { Filter }
export { Play }
export { Pause }
export { Plus }
export { Check }
export { RefreshCw }
export { RotateCcw }
export { Loader }
export { AlertCircle }
export { AlertTriangle }
export { CheckCircle }
export { Star }
export { Heart }
export { Calendar }
export { Clock }
export { History }
export { MapPin }
export { Package }
export { Gift }
export { DollarSign }
export { Code }
export { BookOpen }
export { Grid3X3 }
export { MoreHorizontal }
export { MoreVertical }
export { Zap }
export { Award }
export { Calculator }
export { CreditCard }
export { Globe }
export { Layers }
export { Layout }
export { Minus }
export { Monitor }
export { MousePointer }
export { Palette }
export { Scissors }
export { Smartphone }
export { Tablet }
export { Trophy }
export { Type }
export { AlignLeft }

// Essential aliases for backward compatibility
export const Loader2 = Loader
export const Save = Download
export const Grid = Grid3X3