// Icon mapping system for consistent icon usage across the app
import React from 'react'
import type { ComponentType } from 'react'

// Placeholder component for missing icons
const PlaceholderIcon: React.FC<any> = (props) => null

// Import available icons from lucide-react
import {
  X,
  Calendar,
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
  Grid,
  MoreHorizontal,
  MoreVertical,
  Unlock,
  Heart,
  Flag,
  Tag,
  Sparkles,
  GitCommit,
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
  XCircle,
  File,
  Minimize2,
  Maximize2,
  MessageCircle,
  Send,
  LineChart,
  User,
  Mail,
  Check,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Users as UsersIcon,
  HelpCircle as HelpCircleIcon,
  FileText as FileTextIcon,
  BarChart3 as BarChart3Icon,
  TrendingUp as TrendingUpIcon,
  RefreshCw as RefreshCwIcon,
  MessageSquare as MessageSquareIcon,
  Code as CodeIcon,
  BookOpen as BookOpenIcon,
  ArrowLeft as ArrowLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Shield as ShieldIcon,
  Database as DatabaseIcon,
  WifiOff as WifiOffIcon,
  Lock
} from 'lucide-react'

// Core icon exports - unique and clean
export {
  SettingsIcon as Settings,
  ShieldIcon as Shield,
  DatabaseIcon as Database,
  BellIcon as Bell,
  AlertTriangleIcon as AlertTriangle,
  CheckCircleIcon as CheckCircle,
  CodeIcon as Code,
  SearchIcon as Search,
  BookOpenIcon as BookOpen,
  ArrowLeftIcon as ArrowLeft,
  ChevronRightIcon as ChevronRight,
  MenuIcon as Menu,
  X,
  UsersIcon as Users,
  HelpCircleIcon as HelpCircle,
  Calendar,
  FileTextIcon as FileText,
  BarChart3Icon as BarChart3,
  TrendingUpIcon as TrendingUp,
  Clock,
  RefreshCwIcon as RefreshCw,
  Eye,
  MessageSquareIcon as MessageSquare,
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
  WifiOffIcon as WifiOff,
  Home,
  EyeOff,
  RotateCcw,
  Volume2,
  VolumeX,
  Pause,
  Grid,
  MoreHorizontal,
  MoreVertical,
  Unlock,
  Heart,
  Flag,
  Tag,
  Sparkles,
  GitCommit,
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
  XCircle,
  File,
  Minimize2,
  Maximize2,
  MessageCircle,
  Send,
  LineChart,
  User,
  Mail,
  Check
}

// Icon aliases and fallbacks for missing icons
export const User = Users // Alias for User icon
export const Loader = Loader2 // Alias for Loader icon
export const CheckCircleIcon = CheckCircle // Alias for CheckCircleIcon
export const Mail = Bell // Use Bell as Mail icon
export const SendIcon = Send // Alias for SendIcon
export const ImageIcon = Camera // Use Camera as ImageIcon
export const Save = Download // Alias for Save icon
export const Undo = RotateCcw // Alias for Undo
export const Redo = RotateCcw // Alias for Redo

// Placeholder icons for icons that don't exist in lucide-react
export const Scissors = PlaceholderIcon
export const Gift = PlaceholderIcon
export const PaintBucket = PlaceholderIcon
export const Monitor = PlaceholderIcon
export const Tablet = PlaceholderIcon
export const Smartphone = PlaceholderIcon
export const Globe = PlaceholderIcon
export const Layers = PlaceholderIcon
export const Palette = PlaceholderIcon
export const Calculator = PlaceholderIcon
export const Receipt = PlaceholderIcon
export const Minus = PlaceholderIcon
export const CreditCard = PlaceholderIcon
export const Type = PlaceholderIcon
export const AlignLeft = PlaceholderIcon
export const MousePointer = PlaceholderIcon
export const Layout = PlaceholderIcon
export const Trophy = PlaceholderIcon

// Additional aliases for backward compatibility
export const AlertCircleIcon = AlertCircle
export const XIcon = XCircle
export const HelpIcon = HelpCircle
export const MessageIcon = MessageSquare