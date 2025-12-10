'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Folder, ChevronRight, ChevronDown, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt: string;
  _count?: {
    papers: number;
  };
}

export function CollectionsSidebar() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Collections
          </button>
          <button
            onClick={() => setShowNewDialog(true)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="New Collection"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Collections List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-gray-500">Loading...</div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No collections yet</p>
              <button
                onClick={() => setShowNewDialog(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first collection
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((collection) => (
                <CollectionItem
                  key={collection.id}
                  collection={collection}
                  onUpdate={fetchCollections}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Collection Dialog */}
      {showNewDialog && (
        <NewCollectionDialog
          onClose={() => setShowNewDialog(false)}
          onSuccess={() => {
            setShowNewDialog(false);
            fetchCollections();
          }}
        />
      )}
    </div>
  );
}

function CollectionItem({
  collection,
  onUpdate,
}: {
  collection: Collection;
  onUpdate: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(`/collections/${collection.id}`);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: collection.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {collection.name}
          </div>
          {collection._count && (
            <div className="text-xs text-gray-500">
              {collection._count.papers} papers
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
      </button>

      {showMenu && (
        <div className="absolute right-2 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function NewCollectionDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color }),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          New Collection
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="My Research Papers"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Add a description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
