import { useEffect, useRef, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';

export const useEditor = ({ holder, data, onChange, placeholder = "Comece a escrever ou cole algo..." }) => {
  const editorInstance = useRef(null);

  const initEditor = useCallback(() => {
    if (editorInstance.current) return;

    const editor = new EditorJS({
      holder: holder,
      data: data || {},
      placeholder: placeholder,
      tools: {
        header: {
          class: Header,
          shortcut: 'CMD+SHIFT+H',
          config: {
            levels: [2, 3, 4],
            defaultLevel: 2
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
      },
      onChange: async () => {
        const content = await editor.save();
        if (onChange) onChange(content);
      },
      onReady: () => {
        editorInstance.current = editor;
      }
    });
  }, [holder, data, onChange, placeholder]);

  useEffect(() => {
    initEditor();

    return () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [initEditor]);

  const setEditorData = (newData) => {
    if (editorInstance.current && editorInstance.current.render) {
      editorInstance.current.render(newData);
    }
  };

  return { editorInstance, setEditorData };
};
