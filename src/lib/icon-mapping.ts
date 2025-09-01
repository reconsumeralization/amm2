// Icon mapping system for consistent icon usage across the app
import React from 'react'
import type { ComponentType } from 'react'

// Placeholder component for missing icons
const PlaceholderIcon: React.FC<any> = (props) => null

// Import actual icons from lucide-react that exist
import {
  Settings,
  Shield,
  Database,
  Bell,
  AlertTriangle,
  CheckCircle,
  Code,
  Search,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Menu,
  X,
  Users,
  HelpCircle,
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  RefreshCw,
  Eye,
  MessageSquare,
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
  WifiOff,
  Home,
  EyeOff,
  RotateCcw,
  Volume2,
  LineChart,
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
  File
} from 'lucide-react'

// Core icon exports - unique and clean
export {
  Settings,
  Shield,
  Database,
  Bell,
  AlertTriangle,
  CheckCircle,
  Code,
  Search,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Menu,
  X,
  Users,
  HelpCircle,
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  RefreshCw,
  Eye,
  MessageSquare,
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
  WifiOff,
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
  File
}

// Icon aliases and fallbacks for missing icons
export const User = Users // Alias for User icon
export const Loader = Loader2 // Alias for Loader icon
export const CheckCircleIcon = CheckCircle // Alias for CheckCircleIcon
export const Mail = Bell // Use Bell as Mail icon
export const Send = ArrowRight // Alias for Send icon
export const ImageIcon = Camera // Use Camera as ImageIcon
export const Save = Download // Alias for Save icon
export const Undo = RotateCcw // Alias for Undo
export const Redo = RotateCcw // Alias for Redo
export { LineChart } // Export LineChart from lucide-react

// Placeholder icons for icons that don't exist in lucide-react
export const Scissors = PlaceholderIcon
export const Gift = PlaceholderIcon
export const MessageCircle = PlaceholderIcon
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