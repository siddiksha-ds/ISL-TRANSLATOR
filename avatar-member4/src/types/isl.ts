export type HandshapeName =
  | 'neutral'
  | 'flat_open'
  | 'flat_closed'
  | 'fist'
  | 'point'
  | 'cup'
  | 'pinch'
  | 'ok'
  | 'spread'
  | 'claw'
  | 'l_shape'
  | 'v_shape'
  | 'thumb_up'
  | 'prayer'
  | 'c_shape'
  | 'y_shape'
  | 'bent_flat'
  | 'w_shape'
  | 'r_cross'
  | 'f_shape'
  | 'i_pinky'
  | 'm_three'
  | 'n_two'
  | 'love_ily';

export type NMMType =
  | 'neutral'
  | 'question_yn'
  | 'question_wh'
  | 'affirmative'
  | 'negative'
  | 'happy'
  | 'sad'
  | 'urgent';

export type FingerKey = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

export interface ArmPose {
  /** 0 = hanging down, 90 = straight forward, 145 = raised above head */
  shoulderForward: number;
  /** 0 = beside torso, 90 = out to side (T-pose), negative = across body */
  shoulderOut: number;
  /** Positive rotates forearm inward toward center chest */
  shoulderTwist: number;
  /** 0 = straight arm, 90 = right angle, 135 = bent toward face/chest */
  elbowFlex: number;
  /** 0 = palm inward, +90 = palm down/forward, -90 = palm up/toward face */
  forearmPronation: number;
  /** Positive flexes palm inward; negative extends wrist back */
  wristFlex: number;
  /** Positive tilts hand toward thumb edge; negative toward pinky */
  wristTilt: number;
  handshape: HandshapeName;
}

export interface SignKeyframe {
  /** Relative weight of this keyframe within the sign's total duration */
  durationRatio: number;
  rightArm: ArmPose;
  leftArm?: ArmPose;
  /** Head pitch in degrees (+ = tilt down / nod, - = look up) */
  headPitch?: number;
  /** Head yaw in degrees (+ = turn left, - = turn right) */
  headYaw?: number;
  /** Head roll in degrees (+ = tilt right ear down) */
  headRoll?: number;
  /** Torso forward lean in degrees */
  torsoLean?: number;
  /** Torso twist in degrees */
  torsoTwist?: number;
  nmm?: NMMType;
}

export type SignCategory =
  | 'Greetings'
  | 'Pronouns'
  | 'Questions'
  | 'Time'
  | 'People'
  | 'Actions'
  | 'Places'
  | 'Objects & Needs'
  | 'Emotions'
  | 'Modifiers'
  | 'Fingerspelling';

export interface ISLSignDefinition {
  gloss: string;
  category: SignCategory;
  meaning: string;
  description: string;
  /** Base duration in seconds at 1.0x speed */
  duration: number;
  twoHanded: boolean;
  keyframes: SignKeyframe[];
}

export interface TranslatedGlossToken {
  gloss: string;
  displayLabel: string;
  type: 'sign' | 'fingerspell';
  letters?: string[];
  nmm: NMMType;
  englishSource: string;
  description: string;
}

export interface ISLTranslationResponse {
  originalText: string;
  detectedLanguage: string;
  islGlossSentence: string;
  grammarNote: string;
  sentenceType: 'statement' | 'question_yn' | 'question_wh' | 'imperative' | 'exclamation';
  tokens: TranslatedGlossToken[];
}

export type CameraPreset = 'upper_body' | 'hands_focus' | 'face_nmm';
