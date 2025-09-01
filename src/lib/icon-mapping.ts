// Icon mapping system for consistent icon usage across the app
import * as React from 'react'

// Import all icons from lucide-react
import {
  X,
  CalendarDays as Calendar,
  Clock,
  Eye,
  Star,
  Filter,
  Loader2,
  Copy,
  Download,
  Play,
  ChevronDown,
  ExternalLink,
  Zap,
  Phone,
  MapPin,
  Award,
  ArrowRight,
  Home,
  EyeOff,
  RotateCcw,
  Volume2,
  VolumeX,
  Pause,
  Grid3X3 as Grid,
  MoreHorizontal,
  MoreVertical,
  Lock,
  Unlock,
  Heart,
  Flag,
  Tag,
  Sparkles,
  TrendingDown,
  Activity,
  LogOut,
  Camera,
  Package,
  DollarSign,
  Edit,
  Trash2,
  Share,
  Printer,
  History,
  AlertCircle,
  Plus,
  File,
  MessageCircle,
  Send,
  LineChart,
  Check,
  User,
  Mail,
  Search,
  Settings,
  Bell,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  RefreshCw,
  MessageSquare,
  Code,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Menu,
  Shield,
  Database,
  Minus,
  CreditCard,
  Type,
  AlignLeft,
  MousePointer,
  Layout,
  Trophy,
  Scissors,
  Gift,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  Layers,
  Palette,
  Calculator
} from 'lucide-react'

// Export all icons directly to avoid barrel optimization issues
export {
  // Navigation & UI
  Menu,
  X,
  Home,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,

  // User & Account
  Users,
  Settings,
  Shield,
  Lock,
  Unlock,
  LogOut,

  // Communication
  MessageCircle,
  MessageSquare,
  Send,
  Phone,
  Bell,

  // Content & Media
  File,
  FileText,
  Camera,
  Eye,
  EyeOff,
  Download,
  Copy,
  Share,
  Printer,
  Edit,
  Trash2,

  // Data & Analytics
  Database,
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Filter,

  // Actions & Controls
  Play,
  Pause,
  Plus,
  Minus,
  Check,
  Volume2,
  VolumeX,
  RefreshCw,
  RotateCcw,
  Loader2,

  // Status & Feedback
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Star,
  Heart,
  Flag,

  // Layout & Design
  Grid,
  Layout,
  MoreHorizontal,
  MoreVertical,
  Layers,
  Palette,

  // Time & Calendar
  Calendar,
  Clock,
  History,

  // Location & Contact
  MapPin,
  Globe,

  // Commerce & Finance
  Package,
  DollarSign,
  CreditCard,
  Gift,
  Trophy,
  Award,

  // Development & Code
  Code,
  BookOpen,

  // Devices
  Monitor,
  Tablet,
  Smartphone,

  // Tools & Utilities
  Calculator,
  Type,
  AlignLeft,
  MousePointer,
  Scissors,
  Tag,
  Sparkles,
  Zap
}

// LEGACY ALIASES - DEPRECATED
// These exist for backward compatibility only
// DO NOT ADD NEW ALIASES - Use the canonical names above
export const UsersIcon = Users
export const SendIcon = Send
export const SearchIcon = Search
export const SettingsIcon = Settings
export const BellIcon = Bell
export const MenuIcon = Menu
export const ShieldIcon = Shield
export const DatabaseIcon = Database
export const AlertCircleIcon = AlertCircle
export const AlertTriangleIcon = AlertTriangle
export const CheckCircleIcon = CheckCircle
export const MessageIcon = MessageSquare
export const MessageSquareIcon = MessageSquare
export const FileTextIcon = FileText
export const BarChart3Icon = BarChart3
export const TrendingUpIcon = TrendingUp
export const RefreshCwIcon = RefreshCw
export const CodeIcon = Code
export const BookOpenIcon = BookOpen
export const ArrowLeftIcon = ArrowLeft
export const ChevronRightIcon = ChevronRight
export const CheckIcon = Check
export const UserIcon = User
export const MailIcon = Mail

// FUNCTIONAL ALIASES - These provide semantic meaning
export const Loader = Loader2
export const ImageIcon = Camera
export const Save = Download
export const Undo = RotateCcw
export const Redo = RotateCcw

// PLACEHOLDER ICONS - For icons not available in lucide-react
export const Receipt = PlaceholderIcon
export const PaintBucket = PlaceholderIcon

// LOCKED - This mapping is now frozen
// Any icon additions must go through proper review process
// Contact team lead before making changes