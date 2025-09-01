// Icon mapping system for consistent icon usage across the app
import * as React from 'react'

// Import available icons from lucide-react
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
  Grid3x3 as Grid,
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
export { BarChart3 }
export { LineChart }
export { TrendingUp }
export { TrendingDown }
export { Activity }
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
export { DollarSign }
export { Code }
export { BookOpen }
export { Grid }
export { MoreHorizontal }
export { MoreVertical }
export { Zap }

// Essential aliases for backward compatibility
export const Loader2 = Loader
export const Save = Download