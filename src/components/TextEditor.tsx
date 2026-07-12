import React, { useEffect, useRef, useState } from 'react';
import type Konva from 'konva';
import type { TextObject } from '../types';
import { useEditorStore } from '../store/useEditorStore';

interface TextEditorProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function TextEditor({ stageRef }: TextEditorProps) {
  const {
    editingTextId,
    activeSlideId,
    slides,
    stopEditingText,
    updateObject,
  } = useEditorStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const originalTextRef = useRef('');
  const [text, setText] = useState('');
  const [style, setStyle] = useState<React.CSSProperties>({ display: 'none' });

  const getCurrentText = () => textareaRef.current?.value ?? text;

  const object = React.useMemo(() => {
    if (!editingTextId || !activeSlideId) return null;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return null;
    const obj = slide.objects.find((o) => o.id === editingTextId);
    return obj?.type === 'text' ? (obj as TextObject) : null;
  }, [editingTextId, activeSlideId, slides]);

  useEffect(() => {
    if (!object || !stageRef.current) {
      setStyle({ display: 'none' });
      return;
    }

    const stage = stageRef.current;
    const node = stage.findOne('#' + object.id);
    if (!node) {
      setStyle({ display: 'none' });
      return;
    }

    originalTextRef.current = object.text;
    setText(object.text);

    const pos = node.getAbsolutePosition();
    const scale = node.getAbsoluteScale();
    const rotation = node.getAbsoluteRotation();
    const width = (object.width ?? node.width()) * scale.x;
    const height = node.height() * scale.y;

    setStyle({
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      width: Math.max(20, width),
      minHeight: Math.max(20, height),
      fontSize: object.fontSize * scale.y,
      fontFamily: object.fontFamily ?? 'Arial',
      fontWeight: object.fontStyle?.includes('bold') ? 'bold' : 'normal',
      fontStyle: object.fontStyle?.includes('italic') ? 'italic' : 'normal',
      color: object.fill,
      textAlign: object.align ?? 'left',
      lineHeight: '1.2',
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'top left',
      padding: 0,
      margin: 0,
      border: '1px solid #3b82f6',
      background: 'rgba(255, 255, 255, 0.9)',
      outline: 'none',
      resize: 'none',
      overflow: 'hidden',
      whiteSpace: 'pre',
      zIndex: 100,
    });

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.select();
    });
  }, [object, stageRef, editingTextId]);

  const commit = () => {
    const current = getCurrentText();
    if (editingTextId && current !== originalTextRef.current) {
      updateObject(editingTextId, { text: current });
    }
    stopEditingText();
  };

  const cancel = () => {
    stopEditingText();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commit();
    }
  };

  if (!editingTextId || !object) return null;

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      style={style}
      spellCheck={false}
    />
  );
}
