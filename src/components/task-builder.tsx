'use client';

import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  Search, 
  Database,
  Eye,
  PenTool,
  TableProperties,
  FileSearch,
  ArrowRight,
  Sparkles,
  Globe,
  FlaskConical,
  Presentation,
  FileCode,
  FileImage,
  File,
  Chrome,
  Image,
  PieChart,
  Workflow,
  Smartphone,
  RefreshCw,
  Trash2,
  Edit3,
  BookmarkPlus,
  GitPullRequest,
  GraduationCap,
  Briefcase,
  Layers,
  Code2,
  FileType,
  Microscope
} from 'lucide-react';

interface ActionCard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  href?: string;
}

const wantToActions: ActionCard[] = [
  { icon: BookOpen, label: 'Review Literature', color: 'bg-blue-500', href: '/assistant?tool=literature-review' },
  { icon: PenTool, label: 'Write a Draft', color: 'bg-red-500', href: '/assistant?tool=draft-writer' },
  { icon: BarChart3, label: 'Generate Diagram', color: 'bg-blue-600', href: '/assistant' },
  { icon: Search, label: 'Search Papers', color: 'bg-pink-500', href: '/search' },
  { icon: Database, label: 'Extract Data', color: 'bg-green-600', href: '/assistant?tool=extract-data' },
  { icon: Eye, label: 'Review my Writing', color: 'bg-red-600' },
  { icon: FileText, label: 'Write a Report', color: 'bg-red-500' },
  { icon: TableProperties, label: 'Analyse Data', color: 'bg-orange-500' },
  { icon: FileSearch, label: 'Find Datasets', color: 'bg-blue-500' },
  { icon: Briefcase, label: 'Find Grants', color: 'bg-green-500' },
  { icon: FileImage, label: 'Create Poster', color: 'bg-gray-800' },
  { icon: RefreshCw, label: 'Convert a File', color: 'bg-red-600' },
  { icon: FileSearch, label: 'Search Patents', color: 'bg-blue-400' },
  { icon: RefreshCw, label: 'Paraphrase Text', color: 'bg-red-400' },
  { icon: Trash2, label: 'Clean my Data', color: 'bg-pink-600' },
  { icon: Edit3, label: 'Write Grant Letter', color: 'bg-red-500' },
  { icon: Sparkles, label: 'Solve Equations', color: 'bg-pink-600' },
  { icon: Database, label: 'Scrape Data', color: 'bg-green-500' },
  { icon: Image, label: 'Extract Images', color: 'bg-green-600' },
  { icon: GraduationCap, label: 'Find Courses', color: 'bg-pink-600' },
  { icon: Briefcase, label: 'Find Jobs', color: 'bg-pink-500' },
];

const useActions: ActionCard[] = [
  { icon: Layers, label: 'Deep Review', color: 'bg-orange-500', href: '/assistant' },
  { icon: BookOpen, label: 'Pubmed', color: 'bg-gray-600', href: '/search' },
  { icon: GraduationCap, label: 'Google Scholar', color: 'bg-blue-600', href: '/search' },
  { icon: FileCode, label: 'ArXiV', color: 'bg-red-600', href: '/search' },
  { icon: Code2, label: 'Python Library', color: 'bg-blue-500', href: '/assistant' },
  { icon: Globe, label: 'Grants.gov', color: 'bg-blue-900' },
  { icon: FileText, label: 'Uploaded Files', color: 'bg-red-500' },
  { icon: FlaskConical, label: 'ClinicalTrials.gov', color: 'bg-blue-700' },
  { icon: Search, label: 'Google Search', color: 'bg-blue-500' },
  { icon: FileType, label: 'Google Patents', color: 'bg-orange-600' },
  { icon: Database, label: 'Online Datasets', color: 'bg-blue-600' },
  { icon: Image, label: 'Image Generator', color: 'bg-pink-600' },
];

const makeActions: ActionCard[] = [
  { icon: FileText, label: 'Word document', color: 'bg-blue-600' },
  { icon: Presentation, label: 'PPT presentation', color: 'bg-orange-600' },
  { icon: FileCode, label: 'LaTeX Manuscript', color: 'bg-gray-700' },
  { icon: FileImage, label: 'LaTeX Poster', color: 'bg-red-600' },
  { icon: BarChart3, label: 'Data Visualisation', color: 'bg-blue-500' },
  { icon: FileText, label: 'PDF Report', color: 'bg-red-600' },
  { icon: Chrome, label: 'Website', color: 'bg-blue-600' },
  { icon: Image, label: 'Infographic', color: 'bg-green-600' },
  { icon: Workflow, label: 'Flowchart', color: 'bg-pink-600' },
  { icon: Smartphone, label: 'Interactive App', color: 'bg-red-600' },
  { icon: Image, label: 'Image', color: 'bg-blue-600' },
];

export function TaskBuilder() {
  const router = useRouter();

  const handleActionClick = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  const renderActionSection = (title: string, actions: ActionCard[], emoji: string) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-base">{emoji}</span>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="space-y-1">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => handleActionClick(action.href)}
              className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-white hover:shadow-md rounded-xl transition-all group border border-transparent hover:border-gray-200"
            >
              <div className={`${action.color} w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium truncate text-left">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div className="space-y-6">
        {renderActionSection('I WANT TO', wantToActions.slice(0, 6), '🎯')}
        {renderActionSection('USE', useActions.slice(0, 5), '🔧')}
        {renderActionSection('MAKE A', makeActions.slice(0, 5), '📄')}
      </div>
    </div>
  );
}
