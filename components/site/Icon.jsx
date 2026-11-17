import {
  AppWindow, Award, BadgeCheck, BarChart3, Bell, BookOpen, Bot, Brain, Briefcase, Building2, Calendar, Camera, ChartPie, Check, CheckCircle2, Clock3,
  Cloud, Code2, Compass, CreditCard, Cpu, Database, Download, FileText, FolderPlus, Gauge, Gift, Globe, GraduationCap, Hammer, Handshake, Headphones,
  Heart, Home, KeyRound, Languages, Layers, Layout, LayoutTemplate, LifeBuoy, Lightbulb, LineChart, Link2, Lock, Mail, MapPin, Megaphone, MessageCircle,
  Mic, MonitorSmartphone, MousePointerClick, Package, Palette, PenTool, Phone, PlayCircle, Puzzle, Quote, RefreshCw, Rocket, Save, Search, Send, Server,
  Settings, Share2, ShieldCheck, ShoppingBag, ShoppingCart, Smartphone, Sparkles, Star, Store, Tag, Target, ThumbsUp, Timer, TrendingUp, Trophy, Truck,
  Users, Video, Wallet, Workflow, Wrench, Zap,
} from 'lucide-react';

/* Icons that can be picked or saved anywhere on the site (services, cards, menus, landing pages, steps).
   Named imports keep the page download small: the full icon library is several hundred kilobytes.
   A name that is not listed here shows the Sparkles icon; add it to this list to use it. */
const ICONS = {
  AppWindow, Award, BadgeCheck, BarChart3, Bell, BookOpen, Bot, Brain, Briefcase, Building2, Calendar, Camera, ChartPie, Check, CheckCircle2, Clock3,
  Cloud, Code2, Compass, CreditCard, Cpu, Database, Download, FileText, FolderPlus, Gauge, Gift, Globe, GraduationCap, Hammer, Handshake, Headphones,
  Heart, Home, KeyRound, Languages, Layers, Layout, LayoutTemplate, LifeBuoy, Lightbulb, LineChart, Link2, Lock, Mail, MapPin, Megaphone, MessageCircle,
  Mic, MonitorSmartphone, MousePointerClick, Package, Palette, PenTool, Phone, PlayCircle, Puzzle, Quote, RefreshCw, Rocket, Save, Search, Send, Server,
  Settings, Share2, ShieldCheck, ShoppingBag, ShoppingCart, Smartphone, Sparkles, Star, Store, Tag, Target, ThumbsUp, Timer, TrendingUp, Trophy, Truck,
  Users, Video, Wallet, Workflow, Wrench, Zap,
};

export const ICON_NAMES = Object.keys(ICONS);
export default function Icon({ name, ...p }) { const C = ICONS[name] || Sparkles; return <C {...p} />; }
