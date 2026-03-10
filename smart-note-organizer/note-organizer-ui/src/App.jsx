import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Send, Save, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { useEditor } from './hooks/useEditor';

const API_BASE_URL = 'http://localhost:5000/api/notes'; // Ajustar se a porta do backend mudar

function App() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const editorRef = useRef(null);
  const { setEditorData } = useEditor({
    holder: 'editorjs',
    onChange: (data) => {
      if (currentNote) {
        setCurrentNote(prev => ({ ...prev, contentJson: JSON.stringify(data) }));
      }
    }
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleGenerate = async () => {
    if (!rawInput.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, { text: rawInput });
      const newNote = response.data;
      setNotes([newNote, ...notes]);
      selectNote(newNote);
      setRawInput('');
    } catch (error) {
      alert('Erro ao gerar nota. Verifique se a API Key do Gemini está configurada no backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentNote) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/${currentNote.id}`, currentNote);
      fetchNotes();
      alert('Nota salva com sucesso!');
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir esta nota?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setNotes(notes.filter(n => n.id !== id));
      if (currentNote?.id === id) {
        setCurrentNote(null);
        setEditorData({ blocks: [] });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const selectNote = (note) => {
    setCurrentNote(note);
    const data = JSON.parse(note.contentJson);
    setEditorData(data);
  };

  const createEmptyNote = () => {
    const emptyNote = {
      id: 0,
      title: 'Nova Nota',
      contentJson: JSON.stringify({ blocks: [] }),
      isNew: true
    };
    setCurrentNote(emptyNote);
    setEditorData({ blocks: [] });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            SmartNotes
          </h1>
          <button 
            onClick={createEmptyNote}
            className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {notes.map(note => (
            <div 
              key={note.id}
              onClick={() => selectNote(note)}
              className={`group p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                currentNote?.id === note.id ? 'bg-blue-600' : 'hover:bg-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium truncate flex-1">{note.title}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="text-xs text-slate-400 block mt-1">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Input Area */}
        <div className="p-6 bg-slate-800/50 border-b border-slate-700">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Cole seu texto bruto aqui para a IA organizar..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24 transition-all"
            />
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={loading || !rawInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {loading ? 'Organizando...' : 'Organizar com IA'}
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto bg-slate-900 py-10 px-6">
          <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 min-h-[600px] p-8">
            {currentNote ? (
              <>
                <input 
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  className="text-4xl font-bold bg-transparent border-none focus:outline-none mb-8 w-full placeholder-slate-600"
                  placeholder="Título da nota..."
                />
                <div id="editorjs" className="prose prose-invert max-w-none"></div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                <BookOpen size={64} />
                <p className="text-xl">Selecione ou crie uma nota para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Actions */}
        {currentNote && (
          <div className="absolute bottom-8 right-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl transition-all flex items-center gap-2 group"
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium">
                Salvar Alterações
              </span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
