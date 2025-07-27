/**
 * SELECTIVE LUCIDE ICONS EXPORT
 * Performance Optimization: 830kB → <300kB
 * Sadece kullanılan icon'ları export eder
 */

// Proje genelinde kullanılan tüm icon'lar
import {
  AlertCircle,
  AlertTriangle,
  Apple,
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  // Notifications & Status
  Bell,
  Bug,
  Building,
  Calendar,
  Camera,
  Carrot,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  Download,
  // Actions
  Edit,
  Edit2,
  Eye,
  EyeOff,
  HelpCircle,
  Home,
  Info,
  Leaf,
  Loader,
  Loader2,
  Lock,
  LogOut,
  // Communication
  Mail,
  MapPin,
  Menu,
  // Quantity Controls
  Minus,
  Package,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings,
  Shield,
  // Business Icons
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Trash2,
  Truck,
  // Authentication & User
  User,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  // UI Controls
  X,
  XCircle
} from 'lucide-react';

// Icon name mapping for dynamic usage
export const ICON_MAP = {
  // Authentication & User
  'User': 'User',
  'LogOut': 'LogOut',
  'Eye': 'Eye',
  'EyeOff': 'EyeOff',
  'Lock': 'Lock',

  // UI Controls
  'X': 'X',
  'Menu': 'Menu',
  'ChevronDown': 'ChevronDown',
  'ChevronRight': 'ChevronRight',
  'ChevronLeft': 'ChevronLeft',
  'ArrowLeft': 'ArrowLeft',
  'ArrowRight': 'ArrowRight',

  // Quantity Controls
  'Plus': 'Plus',
  'Minus': 'Minus',

  // Notifications & Status
  'Bell': 'Bell',
  'Info': 'Info',
  'AlertTriangle': 'AlertTriangle',
  'AlertCircle': 'AlertCircle',
  'CheckCircle': 'CheckCircle',
  'XCircle': 'XCircle',
  'HelpCircle': 'HelpCircle',

  // Business Icons
  'ShoppingBag': 'ShoppingBag',
  'ShoppingCart': 'ShoppingCart',
  'Package': 'Package',
  'Store': 'Store',
  'Leaf': 'Leaf',
  'Star': 'Star',

  // Communication
  'Mail': 'Mail',
  'Phone': 'Phone',
  'MapPin': 'MapPin',
  'WifiOff': 'WifiOff',
  'Wifi': 'Wifi',

  // Actions & System
  'Edit': 'Edit',
  'RefreshCw': 'RefreshCw',
  'RotateCcw': 'RotateCcw',
  'Clock': 'Clock',
  'Shield': 'Shield',
  'Users': 'Users',
  'Home': 'Home',
  'Database': 'Database',
  'Archive': 'Archive',
  'Trash2': 'Trash2',
  'Loader': 'Loader',
  'Loader2': 'Loader2',
  'Settings': 'Settings',
  'BarChart3': 'BarChart3',
  'Calendar': 'Calendar',
  'DollarSign': 'DollarSign',
  'CreditCard': 'CreditCard',
  'Truck': 'Truck',
  'Download': 'Download',
  'Apple': 'Apple',
  'Camera': 'Camera',
  'Edit2': 'Edit2',
  'Bug': 'Bug',
  'Building': 'Building',
  'UserCheck': 'UserCheck',
  'Carrot': 'Carrot'
};

/**
 * Get icon component by name
 * @param {string} iconName - Icon name
 * @returns {Component} - Icon component or fallback
 */
export const getIconComponent = (iconName) => {
  // Import all icons at once for easy access
  const icons = {
    User,
    LogOut,
    Eye,
    EyeOff,
    Lock,
    X,
    Menu,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    ArrowRight,
    Plus,
    Minus,
    Bell,
    Info,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    XCircle,
    HelpCircle,
    ShoppingBag,
    ShoppingCart,
    Package,
    Store,
    Leaf,
    Star,
    Mail,
    Phone,
    MapPin,
    WifiOff,
    Wifi,
    Edit,
    RefreshCw,
    RotateCcw,
    Clock,
    Shield,
    Users,
    Home,
    Database,
    Archive,
    Trash2,
    Loader,
    Loader2,
    Settings,
    BarChart3,
    Calendar,
    DollarSign,
    CreditCard,
    Truck,
    Download,
    Apple,
    Camera,
    Edit2,
    Bug,
    Building,
    UserCheck,
    Carrot
  };

  const icon = icons[iconName];
  if (!icon) {
    // Production'da sessiz fallback, development'ta uyarı
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Icon "${iconName}" bulunamadı! HelpCircle fallback kullanılıyor.`);
    }
    return HelpCircle;
  }

  return icon;
};

// Export specific icons for direct import
export {
  AlertCircle, AlertTriangle, Apple, Archive, ArrowLeft,
  ArrowRight, BarChart3, Bell, Bug, Building, Calendar, Camera, Carrot, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Clock, CreditCard, Database, DollarSign, Download, Edit, Edit2, Eye,
  EyeOff, HelpCircle, Home, Info, Leaf, Loader, Loader2, Lock, LogOut, Mail, MapPin, Menu, Minus, Package, Phone, Plus, RefreshCw, RotateCcw, Settings, Shield, ShoppingBag,
  ShoppingCart, Star, Store, Trash2, Truck, User, UserCheck, Users, Wifi, WifiOff, X, XCircle
};

