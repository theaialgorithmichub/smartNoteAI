'use client'
import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  LayoutDashboard, 
  Code2, 
  CalendarDays, 
  Sparkles,
  BookHeart,
  BookText,
  Brush,
  FolderKanban,
  Link,
  BookOpenCheck,
  Wallet,
  Plane,
  ListChecks,
  Palette,
  Feather,
  PenLine,
  Workflow,
  BookCopy,
  Video,
  ImageIcon,
  Zap,
  UtensilsCrossed,
  MapPinned,
  ClipboardList,
  Mic,
  Dumbbell,
  ShoppingCart,
  MessageSquare,
  Languages,
  Trophy,
  StickyNote,
  RefreshCw,
  Boxes,
  Brain,
  Target,
  GitBranch
} from 'lucide-react';
import { NotebookTemplateType } from '@/types/notebook-templates';
import { useRouter } from 'next/navigation';

interface Notebook {
  _id: string;
  title: string;
  template: NotebookTemplateType;
  color?: string;
}

interface DockItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color?: string;
  onClick?: () => void;
}

// Icon mapping for templates - Each template has a unique, distinct icon
const templateIconMap: Record<NotebookTemplateType, React.ReactNode> = {
  'simple': <BookOpen size={20} />,
  'meeting-notes': <Users size={20} />,
  'document': <FileText size={20} />,
  'dashboard': <LayoutDashboard size={20} />,
  'code-notebook': <Code2 size={20} />,
  'planner': <CalendarDays size={20} />,
  'ai-research': <Brain size={20} />,
  'diary': <BookHeart size={20} />,
  'journal': <BookText size={20} />,
  'doodle': <Brush size={20} />,
  'project': <FolderKanban size={20} />,
  'loop': <RefreshCw size={20} />,
  'story': <Feather size={20} />,
  'storytelling': <Sparkles size={20} />,
  'typewriter': <PenLine size={20} />,
  'n8n': <Workflow size={20} />,
  'image-prompt': <ImageIcon size={20} />,
  'video-prompt': <Video size={20} />,
  'link': <Link size={20} />,
  'studybook': <BookOpenCheck size={20} />,
  'flashcard': <Target size={20} />,
  'whiteboard': <Palette size={20} />,
  'recipe': <UtensilsCrossed size={20} />,
  'expense': <Wallet size={20} />,
  'trip': <MapPinned size={20} />,
  'todo': <ListChecks size={20} />,
  'custom': <Boxes size={20} />,
  'sound-box': <Mic size={20} />,
  'book-notes': <BookOpen size={20} />,
  'habit-tracker': <CalendarDays size={20} />,
  'workout-log': <Dumbbell size={20} />,
  'budget-planner': <Wallet size={20} />,
  'class-notes': <FileText size={20} />,
  'research-builder': <Brain size={20} />,
  'grocery-list': <ShoppingCart size={20} />,
  'expense-sharer': <Users size={20} />,
  'project-pipeline': <Workflow size={20} />,
  'prompt-diary': <MessageSquare size={20} />,
  'save-the-date': <CalendarDays size={20} />,
  'important-urls': <Link size={20} />,
  'language-translator': <Languages size={20} />,
  'dictionary': <BookOpen size={20} />,
  'meals-planner': <UtensilsCrossed size={20} />,
  'games-scorecard': <Trophy size={20} />,
  'sticker-book': <StickyNote size={20} />,
  'tutorial-learn': <BookOpen size={20} />,
  'mind-map': <GitBranch size={20} />,
  'goal-tracker': <Target size={20} />,
  'ai-prompt-studio': <Brain size={20} />,
};

interface DockItemProps {
  item: DockItem;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

const DockItemComponent: React.FC<DockItemProps> = ({ item, isHovered, onHover }) => {
  return (
    <div
      className="relative group"
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={`
          relative flex items-center justify-center
          w-11 h-11 rounded-lg
          bg-white/5 backdrop-blur-[2px]
          border border-white/10
          transition-all duration-300 ease-out
          cursor-pointer
          shadow-none
          ${isHovered 
            ? 'scale-110 bg-white/10 border-white/20 -translate-y-1 shadow-lg shadow-white/10' 
            : 'hover:scale-105 hover:bg-white/7 hover:-translate-y-0.5'
          }
        `}
        onClick={item.onClick}
        style={{
          boxShadow: isHovered
            ? '0 4px 24px 0 rgba(255,255,255,0.08)'
            : undefined,
          transitionProperty: 'box-shadow, transform, background, border-color'
        }}
      >
        <div className={`
          text-white transition-all duration-300
          ${isHovered ? 'scale-105 drop-shadow-[0_1px_4px_rgba(255,255,255,0.10)]' : ''}
        `}>
          {item.icon}
        </div>
      </div>
      
      {/* Tooltip */}
      <div className={`
        absolute -top-10 left-1/2 transform -translate-x-1/2
        px-2.5 py-1 rounded-md
        bg-black/70 backdrop-blur
        text-white text-xs font-normal
        border border-white/5
        transition-all duration-200
        pointer-events-none
        whitespace-nowrap
        ${isHovered 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-1'
        }
        shadow-sm
      `}>
        {item.label}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-black/70 rotate-45 border-r border-b border-white/5"></div>
        </div>
      </div>
    </div>
  );
};

interface NotebookDockProps {
  notebooks?: Notebook[];
}

const NotebookDock: React.FC<NotebookDockProps> = ({ notebooks = [] }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const router = useRouter();

  // Show only the latest 5 notebooks (or fewer if user has less than 5)
  const recentNotebooks = notebooks.slice(0, 5);

  // If no notebooks, show empty state
  if (recentNotebooks.length === 0) {
    return null;
  }

  const dockItems: DockItem[] = recentNotebooks.map(notebook => ({
    id: notebook._id,
    icon: templateIconMap[notebook.template] || <BookOpen size={20} />,
    label: notebook.title,
    color: notebook.color,
    onClick: () => {
      router.push(`/dashboard/notebook/${notebook._id}`);
    }
  }));

  return (
    <div className="relative hidden sm:block">
      {/* Dock Container */}
      <div className={`
        flex items-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4
        rounded-2xl
        bg-black/40 backdrop-blur-xl
        border border-white/10
        shadow-2xl
        transition-all duration-500 ease-out
        ${hoveredItem ? 'scale-105' : ''}
      `}>
        {dockItems.map((item) => (
          <DockItemComponent
            key={item.id}
            item={item}
            isHovered={hoveredItem === item.id}
            onHover={setHoveredItem}
          />
        ))}
      </div>
      
      {/* Reflection Effect */}
      <div className="absolute top-full left-0 right-0 h-16 overflow-hidden pointer-events-none">
        <div className={`
          flex items-start gap-3 px-6 py-4
          rounded-2xl
          bg-black/20 backdrop-blur-xl
          border border-white/5
          opacity-30
          transform scale-y-[-1]
          transition-all duration-500 ease-out
          ${hoveredItem ? 'scale-105 scale-y-[-1.05]' : ''}
        `}>
          {dockItems.map((item) => (
            <div
              key={`reflection-${item.id}`}
              className={`
                flex items-center justify-center
                w-11 h-11 rounded-lg
                bg-white/5
                transition-all duration-300 ease-out
                ${hoveredItem === item.id 
                  ? 'scale-110 -translate-y-1' 
                  : ''
                }
              `}
            >
              <div className="text-white/50">
                {item.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotebookDock;
