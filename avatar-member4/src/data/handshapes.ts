import type { HandshapeName } from '../types/isl';

export interface FingerAngles {
  /** Proximal / MCP curl in degrees (0 = straight, 90 = bent) */
  mcp: number;
  /** Middle / PIP curl in degrees */
  pip: number;
  /** Distal / DIP curl in degrees */
  dip: number;
  /** Lateral splay in degrees (positive spreads outward from middle finger) */
  splay: number;
}

export interface ThumbAngles {
  /** Abduction away from palm plane (0 = tucked beside palm, 55 = wide out) */
  abduct: number;
  /** Opposition rotation across palm (0 = flat edge, 75 = facing fingers) */
  oppose: number;
  /** MCP flexion */
  mcp: number;
  /** IP flexion */
  ip: number;
}

export interface HandshapePose {
  thumb: ThumbAngles;
  index: FingerAngles;
  middle: FingerAngles;
  ring: FingerAngles;
  pinky: FingerAngles;
}

const f = (mcp: number, pip: number, dip: number, splay = 0): FingerAngles => ({
  mcp,
  pip,
  dip,
  splay,
});

export const HANDSHAPE_POSES: Record<HandshapeName, HandshapePose> = {
  neutral: {
    thumb: { abduct: 20, oppose: 18, mcp: 12, ip: 10 },
    index: f(14, 18, 10, 2),
    middle: f(16, 20, 12, 0),
    ring: f(20, 24, 14, -2),
    pinky: f(24, 28, 16, -4),
  },
  flat_open: {
    thumb: { abduct: 42, oppose: 10, mcp: 5, ip: 5 },
    index: f(2, 2, 2, 10),
    middle: f(2, 2, 2, 3),
    ring: f(2, 2, 2, -4),
    pinky: f(2, 2, 2, -11),
  },
  flat_closed: {
    thumb: { abduct: 18, oppose: 15, mcp: 8, ip: 5 },
    index: f(2, 2, 2, 1),
    middle: f(2, 2, 2, 0),
    ring: f(2, 2, 2, -1),
    pinky: f(2, 2, 2, -2),
  },
  prayer: {
    thumb: { abduct: 12, oppose: 8, mcp: 4, ip: 4 },
    index: f(0, 0, 0, 0),
    middle: f(0, 0, 0, 0),
    ring: f(0, 0, 0, 0),
    pinky: f(0, 0, 0, 0),
  },
  fist: {
    thumb: { abduct: 24, oppose: 68, mcp: 35, ip: 35 },
    index: f(88, 98, 70, 0),
    middle: f(90, 98, 70, 0),
    ring: f(90, 98, 70, 0),
    pinky: f(88, 95, 70, 0),
  },
  point: {
    thumb: { abduct: 22, oppose: 65, mcp: 30, ip: 25 },
    index: f(0, 0, 0, 0),
    middle: f(88, 96, 65, 0),
    ring: f(90, 96, 65, 0),
    pinky: f(90, 95, 65, 0),
  },
  cup: {
    thumb: { abduct: 30, oppose: 38, mcp: 18, ip: 15 },
    index: f(28, 35, 20, 2),
    middle: f(30, 38, 22, 0),
    ring: f(30, 38, 22, -2),
    pinky: f(32, 38, 22, -4),
  },
  pinch: {
    thumb: { abduct: 34, oppose: 62, mcp: 24, ip: 22 },
    index: f(48, 52, 32, 0),
    middle: f(52, 55, 34, 0),
    ring: f(80, 88, 60, 0),
    pinky: f(82, 88, 60, 0),
  },
  ok: {
    thumb: { abduct: 36, oppose: 64, mcp: 26, ip: 28 },
    index: f(55, 60, 38, 0),
    middle: f(6, 6, 4, 5),
    ring: f(6, 6, 4, -2),
    pinky: f(8, 8, 5, -8),
  },
  spread: {
    thumb: { abduct: 52, oppose: 18, mcp: 5, ip: 5 },
    index: f(4, 4, 4, 15),
    middle: f(4, 4, 4, 4),
    ring: f(4, 4, 4, -6),
    pinky: f(4, 4, 4, -16),
  },
  claw: {
    thumb: { abduct: 42, oppose: 38, mcp: 24, ip: 30 },
    index: f(35, 58, 45, 8),
    middle: f(35, 58, 45, 2),
    ring: f(35, 58, 45, -4),
    pinky: f(38, 58, 45, -10),
  },
  l_shape: {
    thumb: { abduct: 55, oppose: 6, mcp: 2, ip: 2 },
    index: f(0, 0, 0, 4),
    middle: f(88, 95, 68, 0),
    ring: f(90, 95, 68, 0),
    pinky: f(90, 95, 68, 0),
  },
  v_shape: {
    thumb: { abduct: 24, oppose: 68, mcp: 30, ip: 25 },
    index: f(0, 0, 0, 12),
    middle: f(0, 0, 0, -10),
    ring: f(90, 96, 68, 0),
    pinky: f(90, 96, 68, 0),
  },
  thumb_up: {
    thumb: { abduct: 54, oppose: 8, mcp: 0, ip: 0 },
    index: f(88, 96, 68, 0),
    middle: f(90, 96, 68, 0),
    ring: f(90, 96, 68, 0),
    pinky: f(88, 95, 68, 0),
  },
  c_shape: {
    thumb: { abduct: 45, oppose: 46, mcp: 18, ip: 20 },
    index: f(36, 44, 30, 3),
    middle: f(38, 46, 32, 0),
    ring: f(40, 46, 32, -2),
    pinky: f(42, 46, 32, -5),
  },
  y_shape: {
    thumb: { abduct: 54, oppose: 10, mcp: 0, ip: 0 },
    index: f(88, 96, 68, 0),
    middle: f(90, 96, 68, 0),
    ring: f(90, 96, 68, 0),
    pinky: f(0, 0, 0, -14),
  },
  bent_flat: {
    thumb: { abduct: 28, oppose: 32, mcp: 12, ip: 10 },
    index: f(76, 12, 8, 2),
    middle: f(76, 12, 8, 0),
    ring: f(76, 12, 8, -2),
    pinky: f(76, 12, 8, -4),
  },
  w_shape: {
    thumb: { abduct: 22, oppose: 66, mcp: 32, ip: 25 },
    index: f(0, 0, 0, 12),
    middle: f(0, 0, 0, 0),
    ring: f(0, 0, 0, -10),
    pinky: f(90, 95, 65, 0),
  },
  r_cross: {
    thumb: { abduct: 20, oppose: 65, mcp: 30, ip: 25 },
    index: f(8, 5, 5, -6),
    middle: f(2, 0, 0, 6),
    ring: f(90, 96, 65, 0),
    pinky: f(90, 96, 65, 0),
  },
  f_shape: {
    thumb: { abduct: 34, oppose: 60, mcp: 24, ip: 24 },
    index: f(58, 60, 34, 0),
    middle: f(4, 4, 4, 8),
    ring: f(4, 4, 4, 0),
    pinky: f(6, 6, 4, -8),
  },
  i_pinky: {
    thumb: { abduct: 24, oppose: 68, mcp: 34, ip: 28 },
    index: f(88, 96, 68, 0),
    middle: f(90, 96, 68, 0),
    ring: f(90, 96, 68, 0),
    pinky: f(0, 0, 0, -8),
  },
  m_three: {
    thumb: { abduct: 22, oppose: 65, mcp: 32, ip: 28 },
    index: f(0, 0, 0, 8),
    middle: f(0, 0, 0, 0),
    ring: f(0, 0, 0, -8),
    pinky: f(90, 96, 68, 0),
  },
  n_two: {
    thumb: { abduct: 22, oppose: 65, mcp: 32, ip: 28 },
    index: f(0, 0, 0, 6),
    middle: f(0, 0, 0, -6),
    ring: f(90, 96, 68, 0),
    pinky: f(90, 96, 68, 0),
  },
  love_ily: {
    thumb: { abduct: 54, oppose: 10, mcp: 0, ip: 0 },
    index: f(0, 0, 0, 8),
    middle: f(90, 96, 68, 0),
    ring: f(90, 96, 68, 0),
    pinky: f(0, 0, 0, -12),
  },
};
