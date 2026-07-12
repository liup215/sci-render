export type Tool = 'select' | 'rect' | 'circle' | 'text' | 'line';

export interface CanvasSize {
  width: number;
  height: number;
}

export interface BaseObject {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'line';
  x: number;
  y: number;
  rotation?: number;
  draggable?: boolean;
}

export interface RectObject extends BaseObject {
  type: 'rect';
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface CircleObject extends BaseObject {
  type: 'circle';
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextObject extends BaseObject {
  type: 'text';
  text: string;
  fontSize: number;
  fill: string;
  width?: number;
}

export interface LineObject extends BaseObject {
  type: 'line';
  points: number[]; // [x1, y1, x2, y2, ...]
  stroke: string;
  strokeWidth: number;
}

export type CanvasObject = RectObject | CircleObject | TextObject | LineObject;

export interface Slide {
  id: string;
  name: string;
  objects: CanvasObject[];
}

export interface GuideLine {
  id: string;
  points: number[];
  orientation: 'vertical' | 'horizontal';
}
