import type { ArmPose, ISLSignDefinition, SignCategory, SignKeyframe } from '../types/isl';

export const REST_ARM_POSE: ArmPose = {
  shoulderForward: 4,
  shoulderOut: 10,
  shoulderTwist: 6,
  elbowFlex: 18,
  forearmPronation: 0,
  wristFlex: 0,
  wristTilt: 0,
  handshape: 'neutral',
};

const kf = (
  durationRatio: number,
  rightArm: ArmPose,
  leftArm?: ArmPose,
  extra?: Omit<SignKeyframe, 'durationRatio' | 'rightArm' | 'leftArm'>,
): SignKeyframe => ({
  durationRatio,
  rightArm,
  leftArm,
  ...extra,
});

const pose = (
  shoulderForward: number,
  shoulderOut: number,
  shoulderTwist: number,
  elbowFlex: number,
  forearmPronation: number,
  wristFlex: number,
  wristTilt: number,
  handshape: ArmPose['handshape'],
): ArmPose => ({
  shoulderForward,
  shoulderOut,
  shoulderTwist,
  elbowFlex,
  forearmPronation,
  wristFlex,
  wristTilt,
  handshape,
});

const sign = (
  gloss: string,
  category: SignCategory,
  meaning: string,
  description: string,
  duration: number,
  twoHanded: boolean,
  keyframes: SignKeyframe[],
): ISLSignDefinition => ({
  gloss,
  category,
  meaning,
  description,
  duration,
  twoHanded,
  keyframes,
});

export const ISL_LEXICON: Record<string, ISLSignDefinition> = {
  // ======================== GREETINGS ========================
  NAMASTE: sign(
    'NAMASTE',
    'Greetings',
    'Hello / Greetings / Respect',
    'Both flat palms pressed together at chest center with a respectful slight bow.',
    1.25,
    true,
    [
      kf(
        0.35,
        pose(28, 2, 34, 96, 0, -12, 6, 'prayer'),
        pose(28, 2, 34, 96, 0, -12, 6, 'prayer'),
        { headPitch: 4, nmm: 'happy' },
      ),
      kf(
        0.4,
        pose(32, -2, 38, 102, 0, -14, 10, 'prayer'),
        pose(32, -2, 38, 102, 0, -14, 10, 'prayer'),
        { headPitch: 12, torsoLean: 6, nmm: 'happy' },
      ),
      kf(
        0.25,
        pose(26, 2, 32, 92, 0, -10, 4, 'prayer'),
        pose(26, 2, 32, 92, 0, -10, 4, 'prayer'),
        { headPitch: 2, nmm: 'happy' },
      ),
    ],
  ),

  HELLO: sign(
    'HELLO',
    'Greetings',
    'Hello / Hi',
    'Open right hand raised near temple and waved outward in a welcoming arc.',
    1.1,
    false,
    [
      kf(0.3, pose(74, 24, -10, 104, 70, 0, 0, 'flat_open'), undefined, {
        headRoll: -5,
        nmm: 'happy',
      }),
      kf(0.35, pose(76, 36, -18, 92, 80, -8, 12, 'flat_open'), undefined, {
        headRoll: -4,
        nmm: 'happy',
      }),
      kf(0.35, pose(74, 26, -10, 100, 75, 4, -10, 'flat_open'), undefined, {
        nmm: 'happy',
      }),
    ],
  ),

  GOODBYE: sign(
    'GOODBYE',
    'Greetings',
    'Goodbye / Bye',
    'Open palm held forward at shoulder height waving gently side to side.',
    1.15,
    false,
    [
      kf(0.3, pose(58, 24, -6, 86, 82, 0, 14, 'flat_open'), undefined, { nmm: 'happy' }),
      kf(0.35, pose(58, 28, -8, 86, 82, 0, -14, 'flat_open'), undefined, { nmm: 'happy' }),
      kf(0.35, pose(58, 24, -6, 86, 82, 0, 14, 'flat_open'), undefined, { nmm: 'happy' }),
    ],
  ),

  THANK_YOU: sign(
    'THANK_YOU',
    'Greetings',
    'Thank you / Gratitude',
    'Flat fingertips touch the chin and extend smoothly outward toward the listener.',
    1.15,
    false,
    [
      kf(0.35, pose(46, 8, 28, 122, -68, 8, 0, 'flat_closed'), undefined, {
        headPitch: 4,
        nmm: 'happy',
      }),
      kf(0.4, pose(54, 6, 12, 74, -85, 0, 0, 'flat_open'), undefined, {
        headPitch: 8,
        torsoLean: 4,
        nmm: 'happy',
      }),
      kf(0.25, pose(48, 8, 10, 66, -85, 0, 0, 'flat_open'), undefined, { nmm: 'happy' }),
    ],
  ),

  PLEASE: sign(
    'PLEASE',
    'Greetings',
    'Please / Request',
    'Flat palm placed on the center of the chest making a gentle circular motion.',
    1.2,
    false,
    [
      kf(0.3, pose(24, 6, 46, 104, -20, 10, 0, 'flat_closed'), undefined, {
        headPitch: 5,
        nmm: 'neutral',
      }),
      kf(0.35, pose(28, 2, 50, 110, -25, 14, 10, 'flat_closed'), undefined, {
        headPitch: 6,
        nmm: 'neutral',
      }),
      kf(0.35, pose(20, 8, 44, 102, -20, 10, -8, 'flat_closed'), undefined, {
        headPitch: 5,
        nmm: 'neutral',
      }),
    ],
  ),

  SORRY: sign(
    'SORRY',
    'Greetings',
    'Sorry / Apology',
    'Closed fist over the heart moving in a small apologetic circle with lowered head.',
    1.2,
    false,
    [
      kf(0.35, pose(22, 6, 46, 106, -30, 12, 0, 'fist'), undefined, {
        headPitch: 10,
        headRoll: 6,
        nmm: 'sad',
      }),
      kf(0.35, pose(28, 2, 50, 112, -32, 14, 8, 'fist'), undefined, {
        headPitch: 12,
        headRoll: 6,
        nmm: 'sad',
      }),
      kf(0.3, pose(20, 8, 44, 104, -30, 12, -6, 'fist'), undefined, {
        headPitch: 10,
        nmm: 'sad',
      }),
    ],
  ),

  WELCOME: sign(
    'WELCOME',
    'Greetings',
    'Welcome',
    'Open palm extended forward sweeps smoothly inward toward the torso.',
    1.15,
    false,
    [
      kf(0.35, pose(48, 22, -6, 56, -85, 0, 0, 'flat_open'), undefined, { nmm: 'happy' }),
      kf(0.4, pose(32, 8, 34, 98, -75, 10, 0, 'flat_open'), undefined, {
        headPitch: 6,
        nmm: 'happy',
      }),
      kf(0.25, pose(28, 6, 38, 102, -75, 10, 0, 'flat_open'), undefined, { nmm: 'happy' }),
    ],
  ),

  YES: sign(
    'YES',
    'Modifiers',
    'Yes / Agree',
    'Closed fist nods forward at the wrist twice while nodding head affirmatively.',
    0.95,
    false,
    [
      kf(0.3, pose(42, 16, 10, 96, 45, -15, 0, 'fist'), undefined, {
        headPitch: -2,
        nmm: 'affirmative',
      }),
      kf(0.35, pose(40, 16, 10, 92, 45, 28, 0, 'fist'), undefined, {
        headPitch: 14,
        nmm: 'affirmative',
      }),
      kf(0.35, pose(42, 16, 10, 96, 45, 22, 0, 'fist'), undefined, {
        headPitch: 10,
        nmm: 'affirmative',
      }),
    ],
  ),

  NO: sign(
    'NO',
    'Modifiers',
    'No / Not',
    'Index and middle fingers snap onto the thumb with a subtle side-to-side head shake.',
    0.95,
    false,
    [
      kf(0.3, pose(44, 18, 8, 94, 55, 0, 0, 'v_shape'), undefined, {
        headYaw: -10,
        nmm: 'negative',
      }),
      kf(0.35, pose(44, 18, 8, 94, 55, 8, 0, 'pinch'), undefined, {
        headYaw: 12,
        nmm: 'negative',
      }),
      kf(0.35, pose(44, 18, 8, 94, 55, 8, 0, 'pinch'), undefined, {
        headYaw: -8,
        nmm: 'negative',
      }),
    ],
  ),

  // ======================== PRONOUNS ========================
  I: sign(
    'I',
    'Pronouns',
    'I / Me',
    'Right index finger points inward toward the center of the chest.',
    0.85,
    false,
    [
      kf(0.35, pose(24, 8, 42, 104, -55, 18, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.45, pose(22, 4, 48, 114, -60, 24, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.2, pose(24, 6, 44, 106, -55, 18, 0, 'point'), undefined, { nmm: 'neutral' }),
    ],
  ),

  YOU: sign(
    'YOU',
    'Pronouns',
    'You',
    'Right index finger points directly forward at chest height toward the addressee.',
    0.85,
    false,
    [
      kf(0.3, pose(44, 12, 10, 82, 40, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.5, pose(52, 10, 8, 62, 45, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.2, pose(48, 10, 8, 68, 45, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
    ],
  ),

  WE: sign(
    'WE',
    'Pronouns',
    'We / Us',
    'Index finger arcs horizontally from the right shoulder across to the left shoulder.',
    1.1,
    false,
    [
      kf(0.3, pose(32, 16, 12, 105, -45, 14, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.4, pose(34, 4, 34, 96, -50, 12, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.3, pose(32, -8, 52, 104, -45, 14, 0, 'point'), undefined, { nmm: 'neutral' }),
    ],
  ),

  THEY: sign(
    'THEY',
    'Pronouns',
    'They / Them',
    'Index finger sweeps sideways across neutral space indicating others.',
    1.0,
    false,
    [
      kf(0.3, pose(48, 4, 24, 72, 40, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.45, pose(48, 28, -14, 68, 40, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.25, pose(48, 32, -16, 68, 40, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
    ],
  ),

  MY: sign(
    'MY',
    'Pronouns',
    'My / Mine',
    'Flat open palm presses gently against the center of the chest.',
    0.9,
    false,
    [
      kf(0.35, pose(24, 8, 40, 100, -25, 10, 0, 'flat_closed'), undefined, { nmm: 'neutral' }),
      kf(0.45, pose(22, 4, 48, 112, -25, 14, 0, 'flat_closed'), undefined, { nmm: 'neutral' }),
      kf(0.2, pose(24, 6, 44, 106, -25, 10, 0, 'flat_closed'), undefined, { nmm: 'neutral' }),
    ],
  ),

  YOUR: sign(
    'YOUR',
    'Pronouns',
    'Your / Yours',
    'Flat palm faces forward toward the listener at mid-chest level.',
    0.9,
    false,
    [
      kf(0.35, pose(46, 12, 6, 78, 85, -18, 0, 'flat_closed'), undefined, { nmm: 'neutral' }),
      kf(0.45, pose(54, 12, 6, 56, 85, -24, 0, 'flat_closed'), undefined, { nmm: 'neutral' }),
      kf(0.2, pose(50, 12, 6, 64, 85, -20, 0, 'flat_closed'), undefined, { nmm: 'neutral' }),
    ],
  ),

  // ======================== QUESTIONS (WH & Y/N) ========================
  WHAT: sign(
    'WHAT',
    'Questions',
    'What?',
    'Both palms open upward with slight outward shake and furrowed brows (WH-NMM).',
    1.05,
    true,
    [
      kf(
        0.35,
        pose(38, 18, 4, 86, -85, -10, 0, 'flat_open'),
        pose(38, 18, 4, 86, -85, -10, 0, 'flat_open'),
        { headPitch: 4, headRoll: -5, nmm: 'question_wh' },
      ),
      kf(
        0.35,
        pose(40, 26, -6, 82, -92, -12, 8, 'flat_open'),
        pose(40, 26, -6, 82, -92, -12, 8, 'flat_open'),
        { headPitch: 5, headRoll: -5, nmm: 'question_wh' },
      ),
      kf(
        0.3,
        pose(38, 22, 0, 84, -88, -10, -4, 'flat_open'),
        pose(38, 22, 0, 84, -88, -10, -4, 'flat_open'),
        { headPitch: 4, nmm: 'question_wh' },
      ),
    ],
  ),

  WHERE: sign(
    'WHERE',
    'Questions',
    'Where?',
    'Index finger points upward and waves slightly side to side with questioning brow.',
    1.0,
    false,
    [
      kf(0.3, pose(48, 18, 6, 98, 65, -10, -10, 'point'), undefined, {
        headRoll: 5,
        nmm: 'question_wh',
      }),
      kf(0.35, pose(48, 22, 2, 98, 65, -10, 14, 'point'), undefined, {
        headRoll: 5,
        nmm: 'question_wh',
      }),
      kf(0.35, pose(48, 18, 6, 98, 65, -10, -12, 'point'), undefined, {
        headRoll: 5,
        nmm: 'question_wh',
      }),
    ],
  ),

  WHO: sign(
    'WHO',
    'Questions',
    'Who?',
    'Thumb or index circles gently near the chin/mouth with WH questioning expression.',
    1.05,
    false,
    [
      kf(0.35, pose(46, 10, 26, 122, -45, 0, 0, 'l_shape'), undefined, {
        headPitch: 4,
        nmm: 'question_wh',
      }),
      kf(0.35, pose(48, 8, 28, 120, -45, 16, 0, 'l_shape'), undefined, {
        headPitch: 5,
        nmm: 'question_wh',
      }),
      kf(0.3, pose(46, 10, 26, 122, -45, 0, 0, 'l_shape'), undefined, {
        headPitch: 4,
        nmm: 'question_wh',
      }),
    ],
  ),

  WHEN: sign(
    'WHEN',
    'Questions',
    'When?',
    'Right index finger circles around the tip of the stationary left index finger.',
    1.15,
    true,
    [
      kf(
        0.3,
        pose(42, 12, 24, 88, 25, 0, 0, 'point'),
        pose(40, 10, 26, 92, 0, 0, 10, 'point'),
        { nmm: 'question_wh' },
      ),
      kf(
        0.4,
        pose(48, 6, 30, 86, 40, 12, 0, 'point'),
        pose(40, 10, 26, 92, 0, 0, 10, 'point'),
        { headPitch: 4, nmm: 'question_wh' },
      ),
      kf(
        0.3,
        pose(42, 10, 28, 90, 25, 0, 0, 'point'),
        pose(40, 10, 26, 92, 0, 0, 10, 'point'),
        { nmm: 'question_wh' },
      ),
    ],
  ),

  WHY: sign(
    'WHY',
    'Questions',
    'Why?',
    'Fingertips touch the forehead and pull forward into a Y/open handshape.',
    1.1,
    false,
    [
      kf(0.35, pose(78, 14, 18, 114, -65, 8, 0, 'flat_closed'), undefined, {
        headRoll: -5,
        nmm: 'question_wh',
      }),
      kf(0.4, pose(70, 20, 8, 92, 10, 0, 0, 'y_shape'), undefined, {
        headPitch: 4,
        headRoll: -5,
        nmm: 'question_wh',
      }),
      kf(0.25, pose(66, 22, 6, 86, 10, 0, 0, 'y_shape'), undefined, {
        nmm: 'question_wh',
      }),
    ],
  ),

  HOW: sign(
    'HOW',
    'Questions',
    'How?',
    'Curved knuckles meet at chest center and roll forward to open upward palms.',
    1.15,
    true,
    [
      kf(
        0.35,
        pose(36, 4, 28, 92, 55, 16, 0, 'bent_flat'),
        pose(36, 4, 28, 92, 55, 16, 0, 'bent_flat'),
        { headPitch: 4, nmm: 'question_wh' },
      ),
      kf(
        0.4,
        pose(42, 12, 14, 80, -85, -10, 0, 'flat_open'),
        pose(42, 12, 14, 80, -85, -10, 0, 'flat_open'),
        { headPitch: 5, nmm: 'question_wh' },
      ),
      kf(
        0.25,
        pose(40, 14, 12, 82, -85, -8, 0, 'flat_open'),
        pose(40, 14, 12, 82, -85, -8, 0, 'flat_open'),
        { nmm: 'question_wh' },
      ),
    ],
  ),

  // ======================== TIME ========================
  TODAY: sign(
    'TODAY',
    'Time',
    'Today / Now',
    'Both upturned palms drop slightly downward in front of the waist indicating present time.',
    1.0,
    true,
    [
      kf(
        0.35,
        pose(38, 12, 16, 86, -85, -8, 0, 'y_shape'),
        pose(38, 12, 16, 86, -85, -8, 0, 'y_shape'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(28, 12, 16, 72, -88, 6, 0, 'y_shape'),
        pose(28, 12, 16, 72, -88, 6, 0, 'y_shape'),
        { headPitch: 4, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(26, 12, 16, 74, -88, 6, 0, 'y_shape'),
        pose(26, 12, 16, 74, -88, 6, 0, 'y_shape'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  TOMORROW: sign(
    'TOMORROW',
    'Time',
    'Tomorrow / Future',
    'Thumb-extended hand starts near cheek/jaw and arcs forward into tomorrow.',
    1.05,
    false,
    [
      kf(0.35, pose(52, 16, 22, 118, 25, 0, 0, 'thumb_up'), undefined, { nmm: 'neutral' }),
      kf(0.4, pose(64, 12, 10, 72, 20, -14, 0, 'thumb_up'), undefined, {
        headPitch: -2,
        nmm: 'neutral',
      }),
      kf(0.25, pose(62, 12, 10, 68, 20, -14, 0, 'thumb_up'), undefined, { nmm: 'neutral' }),
    ],
  ),

  YESTERDAY: sign(
    'YESTERDAY',
    'Time',
    'Yesterday / Past',
    'Thumb touches cheek and moves backward toward the ear indicating past time.',
    1.05,
    false,
    [
      kf(0.35, pose(56, 16, 20, 116, 20, 0, 0, 'thumb_up'), undefined, { nmm: 'neutral' }),
      kf(0.4, pose(54, 24, -10, 124, 15, 0, -10, 'thumb_up'), undefined, {
        headRoll: -4,
        nmm: 'neutral',
      }),
      kf(0.25, pose(52, 24, -10, 122, 15, 0, -10, 'thumb_up'), undefined, { nmm: 'neutral' }),
    ],
  ),

  MORNING: sign(
    'MORNING',
    'Time',
    'Morning',
    'Flat right arm rises upward like the rising sun over the horizontal left forearm.',
    1.15,
    true,
    [
      kf(
        0.35,
        pose(24, 10, 36, 98, -75, 0, 0, 'flat_open'),
        pose(28, 8, 42, 94, 85, 0, 0, 'flat_closed'),
        { nmm: 'happy' },
      ),
      kf(
        0.4,
        pose(54, 12, 24, 112, -85, 0, 0, 'flat_open'),
        pose(28, 8, 42, 94, 85, 0, 0, 'flat_closed'),
        { headPitch: -3, nmm: 'happy' },
      ),
      kf(
        0.25,
        pose(58, 12, 22, 114, -85, 0, 0, 'flat_open'),
        pose(28, 8, 42, 94, 85, 0, 0, 'flat_closed'),
        { nmm: 'happy' },
      ),
    ],
  ),

  NIGHT: sign(
    'NIGHT',
    'Time',
    'Night / Evening',
    'Curved right hand arcs downward over the horizontal left wrist like sunset.',
    1.15,
    true,
    [
      kf(
        0.35,
        pose(52, 12, 20, 96, 85, -10, 0, 'bent_flat'),
        pose(30, 8, 40, 92, 85, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(32, 6, 36, 96, 85, 20, 0, 'bent_flat'),
        pose(30, 8, 40, 92, 85, 0, 0, 'flat_closed'),
        { headPitch: 4, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(30, 6, 36, 94, 85, 20, 0, 'bent_flat'),
        pose(30, 8, 40, 92, 85, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  TIME: sign(
    'TIME',
    'Time',
    'Time / Clock',
    'Right index finger taps the back of the left wrist where a watch sits.',
    1.0,
    true,
    [
      kf(
        0.35,
        pose(36, 10, 32, 100, 65, 10, 0, 'point'),
        pose(30, 6, 44, 96, 85, 0, 0, 'flat_closed'),
        { headPitch: 6, nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(32, 6, 38, 104, 65, 18, 0, 'point'),
        pose(30, 6, 44, 96, 85, 0, 0, 'flat_closed'),
        { headPitch: 8, nmm: 'neutral' },
      ),
      kf(
        0.3,
        pose(36, 10, 32, 100, 65, 10, 0, 'point'),
        pose(30, 6, 44, 96, 85, 0, 0, 'flat_closed'),
        { headPitch: 6, nmm: 'neutral' },
      ),
    ],
  ),

  // ======================== PEOPLE ========================
  MOTHER: sign(
    'MOTHER',
    'People',
    'Mother / Mom',
    'Thumb of open hand taps gently near the chin/cheek representing mother.',
    1.05,
    false,
    [
      kf(0.35, pose(48, 14, 24, 120, -15, 0, 0, 'flat_open'), undefined, {
        headPitch: 2,
        nmm: 'happy',
      }),
      kf(0.35, pose(46, 10, 28, 124, -15, 6, 0, 'flat_open'), undefined, {
        headPitch: 4,
        nmm: 'happy',
      }),
      kf(0.3, pose(48, 14, 24, 120, -15, 0, 0, 'flat_open'), undefined, { nmm: 'happy' }),
    ],
  ),

  FATHER: sign(
    'FATHER',
    'People',
    'Father / Dad',
    'Thumb of open hand taps gently at the forehead representing father.',
    1.05,
    false,
    [
      kf(0.35, pose(76, 16, 18, 112, -10, 0, 0, 'flat_open'), undefined, {
        headPitch: 0,
        nmm: 'happy',
      }),
      kf(0.35, pose(76, 12, 22, 116, -10, 6, 0, 'flat_open'), undefined, {
        headPitch: 2,
        nmm: 'happy',
      }),
      kf(0.3, pose(76, 16, 18, 112, -10, 0, 0, 'flat_open'), undefined, { nmm: 'happy' }),
    ],
  ),

  FRIEND: sign(
    'FRIEND',
    'People',
    'Friend',
    'Both index fingers hook and link together gently in front of the chest.',
    1.15,
    true,
    [
      kf(
        0.35,
        pose(38, 8, 28, 92, 20, 12, 0, 'point'),
        pose(36, 8, 32, 92, -65, 12, 0, 'point'),
        { nmm: 'happy' },
      ),
      kf(
        0.4,
        pose(36, 4, 34, 94, 55, 24, 0, 'point'),
        pose(36, 4, 34, 94, -55, 24, 0, 'point'),
        { headPitch: 4, nmm: 'happy' },
      ),
      kf(
        0.25,
        pose(38, 6, 32, 92, 40, 18, 0, 'point'),
        pose(36, 6, 32, 92, -50, 18, 0, 'point'),
        { nmm: 'happy' },
      ),
    ],
  ),

  FAMILY: sign(
    'FAMILY',
    'People',
    'Family',
    'Both F-hands start touching in front of chest and arc outward to meet.',
    1.2,
    true,
    [
      kf(
        0.3,
        pose(40, 2, 28, 88, 15, 0, 0, 'f_shape'),
        pose(40, 2, 28, 88, 15, 0, 0, 'f_shape'),
        { nmm: 'happy' },
      ),
      kf(
        0.4,
        pose(42, 20, -4, 80, 45, 0, 0, 'f_shape'),
        pose(42, 20, -4, 80, 45, 0, 0, 'f_shape'),
        { nmm: 'happy' },
      ),
      kf(
        0.3,
        pose(44, 4, 24, 84, 70, 0, 0, 'f_shape'),
        pose(44, 4, 24, 84, 70, 0, 0, 'f_shape'),
        { headPitch: 4, nmm: 'happy' },
      ),
    ],
  ),

  TEACHER: sign(
    'TEACHER',
    'People',
    'Teacher',
    'Pinched hands move forward from the temples indicating sharing knowledge.',
    1.15,
    true,
    [
      kf(
        0.35,
        pose(74, 18, 12, 110, 0, 8, 0, 'pinch'),
        pose(74, 18, 12, 110, 0, 8, 0, 'pinch'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(68, 16, 4, 76, 10, -8, 0, 'pinch'),
        pose(68, 16, 4, 76, 10, -8, 0, 'pinch'),
        { nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(64, 16, 4, 74, 10, -6, 0, 'flat_open'),
        pose(64, 16, 4, 74, 10, -6, 0, 'flat_open'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  DOCTOR: sign(
    'DOCTOR',
    'People',
    'Doctor',
    'Index and middle fingers tap the inner pulse point of the left wrist.',
    1.1,
    true,
    [
      kf(
        0.35,
        pose(36, 10, 30, 96, 60, 8, 0, 'n_two'),
        pose(32, 6, 38, 92, -85, 0, 0, 'flat_open'),
        { headPitch: 5, nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(32, 6, 36, 100, 60, 14, 0, 'n_two'),
        pose(32, 6, 38, 92, -85, 0, 0, 'flat_open'),
        { headPitch: 6, nmm: 'neutral' },
      ),
      kf(
        0.3,
        pose(36, 10, 30, 96, 60, 8, 0, 'n_two'),
        pose(32, 6, 38, 92, -85, 0, 0, 'flat_open'),
        { headPitch: 5, nmm: 'neutral' },
      ),
    ],
  ),

  PERSON: sign(
    'PERSON',
    'People',
    'Person / Human',
    'Both flat palms move smoothly downward parallel from chest to waist.',
    1.0,
    true,
    [
      kf(
        0.35,
        pose(42, 12, 10, 88, 0, 0, 0, 'flat_closed'),
        pose(42, 12, 10, 88, 0, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(20, 12, 10, 76, 0, 0, 0, 'flat_closed'),
        pose(20, 12, 10, 76, 0, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(18, 12, 10, 74, 0, 0, 0, 'flat_closed'),
        pose(18, 12, 10, 74, 0, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  NAME: sign(
    'NAME',
    'People',
    'Name',
    'Right H/N fingers tap twice across the left index and middle fingers.',
    1.05,
    true,
    [
      kf(
        0.35,
        pose(40, 10, 26, 94, 40, 0, 0, 'n_two'),
        pose(36, 8, 36, 94, 0, 0, 0, 'n_two'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(36, 6, 34, 98, 40, 8, 0, 'n_two'),
        pose(36, 8, 36, 94, 0, 0, 0, 'n_two'),
        { headPitch: 3, nmm: 'neutral' },
      ),
      kf(
        0.3,
        pose(40, 10, 26, 94, 40, 0, 0, 'n_two'),
        pose(36, 8, 36, 94, 0, 0, 0, 'n_two'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  // ======================== ACTIONS ========================
  GO: sign(
    'GO',
    'Actions',
    'Go / Move',
    'Both index fingers tilt forward together in the direction of movement.',
    0.95,
    true,
    [
      kf(
        0.35,
        pose(40, 10, 14, 92, 10, -10, 10, 'point'),
        pose(40, 10, 14, 92, 10, -10, 10, 'point'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(56, 10, 8, 56, 20, 18, -10, 'point'),
        pose(56, 10, 8, 56, 20, 18, -10, 'point'),
        { torsoLean: 4, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(54, 10, 8, 60, 20, 14, -8, 'point'),
        pose(54, 10, 8, 60, 20, 14, -8, 'point'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  COME: sign(
    'COME',
    'Actions',
    'Come',
    'Index finger extends forward and curls inward beckoning toward the chest.',
    0.95,
    false,
    [
      kf(0.35, pose(54, 12, 8, 60, 20, 10, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.4, pose(38, 10, 26, 100, -30, 15, 0, 'point'), undefined, {
        headPitch: 4,
        nmm: 'neutral',
      }),
      kf(0.25, pose(36, 10, 28, 104, -30, 18, 0, 'point'), undefined, { nmm: 'neutral' }),
    ],
  ),

  EAT: sign(
    'EAT',
    'Actions',
    'Eat / Food',
    'Pinched fingertips move cleanly toward the mouth twice.',
    1.05,
    false,
    [
      kf(0.3, pose(42, 10, 22, 104, -55, 0, 0, 'pinch'), undefined, { nmm: 'neutral' }),
      kf(0.35, pose(48, 8, 28, 124, -65, 10, 0, 'pinch'), undefined, {
        headPitch: 4,
        nmm: 'neutral',
      }),
      kf(0.35, pose(44, 10, 24, 110, -58, 4, 0, 'pinch'), undefined, { nmm: 'neutral' }),
    ],
  ),

  DRINK: sign(
    'DRINK',
    'Actions',
    'Drink',
    'C-shaped hand mimics lifting a cup smoothly toward the lips.',
    1.1,
    false,
    [
      kf(0.35, pose(36, 12, 18, 88, 10, 0, 0, 'c_shape'), undefined, { nmm: 'neutral' }),
      kf(0.4, pose(48, 10, 26, 118, 15, 0, 24, 'c_shape'), undefined, {
        headPitch: -6,
        nmm: 'neutral',
      }),
      kf(0.25, pose(42, 10, 22, 104, 10, 0, 12, 'c_shape'), undefined, { nmm: 'neutral' }),
    ],
  ),

  HELP: sign(
    'HELP',
    'Actions',
    'Help / Support',
    'Closed thumb-up right fist rests on open left palm and both lift upward together.',
    1.15,
    true,
    [
      kf(
        0.35,
        pose(32, 6, 30, 90, 0, 0, 0, 'thumb_up'),
        pose(30, 8, 32, 86, -88, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(46, 6, 28, 96, 0, 0, 0, 'thumb_up'),
        pose(44, 8, 30, 92, -88, 0, 0, 'flat_closed'),
        { headPitch: -2, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(44, 6, 28, 94, 0, 0, 0, 'thumb_up'),
        pose(42, 8, 30, 90, -88, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  WANT: sign(
    'WANT',
    'Actions',
    'Want / Need',
    'Both open clawed palms pull smoothly inward toward the body.',
    1.05,
    true,
    [
      kf(
        0.35,
        pose(48, 14, 8, 66, -85, -8, 0, 'claw'),
        pose(48, 14, 8, 66, -85, -8, 0, 'claw'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(32, 12, 18, 98, -80, 10, 0, 'claw'),
        pose(32, 12, 18, 98, -80, 10, 0, 'claw'),
        { headPitch: 4, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(30, 12, 18, 96, -80, 10, 0, 'claw'),
        pose(30, 12, 18, 96, -80, 10, 0, 'claw'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  NEED: sign(
    'NEED',
    'Actions',
    'Need / Must',
    'Bent X/index finger presses decisively downward in front of chest.',
    0.95,
    false,
    [
      kf(0.35, pose(46, 14, 14, 96, 25, -15, 0, 'point'), undefined, { nmm: 'urgent' }),
      kf(0.4, pose(34, 14, 14, 88, 35, 22, 0, 'point'), undefined, {
        headPitch: 6,
        nmm: 'urgent',
      }),
      kf(0.25, pose(34, 14, 14, 88, 35, 20, 0, 'point'), undefined, { nmm: 'urgent' }),
    ],
  ),

  UNDERSTAND: sign(
    'UNDERSTAND',
    'Actions',
    'Understand',
    'Closed fist near temple flicks index finger straight up with an affirmative nod.',
    1.0,
    false,
    [
      kf(0.35, pose(74, 18, 12, 114, -55, 0, 0, 'fist'), undefined, {
        headPitch: 2,
        nmm: 'affirmative',
      }),
      kf(0.4, pose(76, 18, 12, 112, -55, 0, 0, 'point'), undefined, {
        headPitch: 10,
        nmm: 'affirmative',
      }),
      kf(0.25, pose(76, 18, 12, 112, -55, 0, 0, 'point'), undefined, {
        headPitch: 6,
        nmm: 'affirmative',
      }),
    ],
  ),

  KNOW: sign(
    'KNOW',
    'Actions',
    'Know',
    'Flat fingertips tap the side of the forehead representing knowledge.',
    0.95,
    false,
    [
      kf(0.35, pose(76, 16, 16, 110, -45, 6, 0, 'flat_closed'), undefined, { nmm: 'neutral' }),
      kf(0.35, pose(76, 12, 22, 116, -45, 12, 0, 'flat_closed'), undefined, {
        headPitch: 4,
        nmm: 'neutral',
      }),
      kf(0.3, pose(76, 16, 16, 110, -45, 6, 0, 'flat_closed'), undefined, { nmm: 'neutral' }),
    ],
  ),

  THINK: sign(
    'THINK',
    'Actions',
    'Think / Idea',
    'Index finger touches the temple gently while tilting head slightly in thought.',
    1.0,
    false,
    [
      kf(0.35, pose(76, 18, 16, 112, -40, 6, 0, 'point'), undefined, {
        headRoll: -6,
        nmm: 'neutral',
      }),
      kf(0.4, pose(76, 14, 20, 116, -40, 10, 0, 'point'), undefined, {
        headRoll: -8,
        nmm: 'neutral',
      }),
      kf(0.25, pose(76, 16, 18, 114, -40, 8, 0, 'point'), undefined, {
        headRoll: -6,
        nmm: 'neutral',
      }),
    ],
  ),

  LEARN: sign(
    'LEARN',
    'Actions',
    'Learn / Study',
    'Right fingers gather information from the open left palm and bring it to the forehead.',
    1.2,
    true,
    [
      kf(
        0.35,
        pose(38, 6, 30, 92, 60, 10, 0, 'flat_open'),
        pose(36, 8, 32, 90, -85, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(74, 14, 20, 114, -55, 8, 0, 'pinch'),
        pose(36, 8, 32, 90, -85, 0, 0, 'flat_closed'),
        { headPitch: 2, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(76, 14, 20, 116, -55, 10, 0, 'pinch'),
        pose(36, 8, 32, 90, -85, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  WORK: sign(
    'WORK',
    'Actions',
    'Work / Job',
    'Closed right fist taps gently twice on the back of the closed left fist.',
    1.1,
    true,
    [
      kf(
        0.3,
        pose(42, 6, 30, 96, 75, 0, 0, 'fist'),
        pose(32, 6, 38, 94, 75, 0, 0, 'fist'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(34, 6, 36, 98, 75, 8, 0, 'fist'),
        pose(32, 6, 38, 94, 75, 0, 0, 'fist'),
        { headPitch: 3, nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(40, 6, 32, 96, 75, 0, 0, 'fist'),
        pose(32, 6, 38, 94, 75, 0, 0, 'fist'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  SPEAK: sign(
    'SPEAK',
    'Actions',
    'Speak / Talk / Say',
    'Index finger moves forward from the lips in rhythmic speaking arcs.',
    1.05,
    false,
    [
      kf(0.35, pose(48, 8, 28, 122, -45, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.35, pose(54, 8, 14, 88, 15, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
      kf(0.3, pose(50, 8, 24, 112, -30, 0, 0, 'point'), undefined, { nmm: 'neutral' }),
    ],
  ),

  LISTEN: sign(
    'LISTEN',
    'Actions',
    'Listen / Hear',
    'Cupped right hand raises beside the ear leaning slightly forward attentively.',
    1.05,
    false,
    [
      kf(0.35, pose(64, 24, -6, 118, -45, 0, 0, 'cup'), undefined, {
        headRoll: 8,
        nmm: 'neutral',
      }),
      kf(0.4, pose(66, 22, -8, 122, -45, 6, 0, 'cup'), undefined, {
        headRoll: 10,
        torsoLean: 4,
        nmm: 'neutral',
      }),
      kf(0.25, pose(64, 24, -6, 118, -45, 0, 0, 'cup'), undefined, {
        headRoll: 8,
        nmm: 'neutral',
      }),
    ],
  ),

  LOOK: sign(
    'LOOK',
    'Actions',
    'See / Look / Watch',
    'V-hand points outward from near the eye toward the direction of gaze.',
    1.0,
    false,
    [
      kf(0.35, pose(68, 14, 16, 112, -70, 0, 0, 'v_shape'), undefined, { nmm: 'neutral' }),
      kf(0.4, pose(64, 12, 8, 66, 55, 0, 0, 'v_shape'), undefined, { nmm: 'neutral' }),
      kf(0.25, pose(64, 12, 8, 68, 55, 0, 0, 'v_shape'), undefined, { nmm: 'neutral' }),
    ],
  ),

  READ: sign(
    'READ',
    'Actions',
    'Read',
    'Right V-fingers scan down across the open left palm like reading a page.',
    1.15,
    true,
    [
      kf(
        0.35,
        pose(42, 8, 28, 94, 55, 10, 0, 'v_shape'),
        pose(36, 8, 34, 88, -75, 0, 0, 'flat_closed'),
        { headPitch: 8, nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(32, 8, 34, 98, 55, 22, 0, 'v_shape'),
        pose(36, 8, 34, 88, -75, 0, 0, 'flat_closed'),
        { headPitch: 10, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(34, 8, 32, 96, 55, 16, 0, 'v_shape'),
        pose(36, 8, 34, 88, -75, 0, 0, 'flat_closed'),
        { headPitch: 8, nmm: 'neutral' },
      ),
    ],
  ),

  WRITE: sign(
    'WRITE',
    'Actions',
    'Write',
    'Pinched right hand moves across the open left palm as if writing with a pen.',
    1.15,
    true,
    [
      kf(
        0.3,
        pose(38, 12, 24, 92, 60, 0, 0, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { headPitch: 8, nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(36, 4, 38, 98, 60, 8, 0, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { headPitch: 9, nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(38, 10, 26, 94, 60, 4, 0, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { headPitch: 8, nmm: 'neutral' },
      ),
    ],
  ),

  SLEEP: sign(
    'SLEEP',
    'Actions',
    'Sleep / Rest',
    'Open hand lowers gently past the face as eyes rest and head tilts softly.',
    1.15,
    false,
    [
      kf(0.35, pose(66, 12, 20, 106, -75, 0, 0, 'flat_open'), undefined, {
        headPitch: 4,
        nmm: 'neutral',
      }),
      kf(0.4, pose(44, 10, 28, 118, -65, 14, 0, 'pinch'), undefined, {
        headPitch: 12,
        headRoll: 10,
        nmm: 'neutral',
      }),
      kf(0.25, pose(42, 10, 28, 118, -65, 14, 0, 'pinch'), undefined, {
        headPitch: 12,
        headRoll: 10,
        nmm: 'neutral',
      }),
    ],
  ),

  LOVE: sign(
    'LOVE',
    'Emotions',
    'Love / Affection',
    'Both arms cross over the heart in a warm embrace gesture.',
    1.2,
    true,
    [
      kf(
        0.35,
        pose(26, 12, 30, 84, -30, 0, 0, 'fist'),
        pose(26, 12, 30, 84, -30, 0, 0, 'fist'),
        { nmm: 'happy' },
      ),
      kf(
        0.4,
        pose(22, -6, 56, 112, -55, 12, 0, 'fist'),
        pose(24, -6, 58, 114, -55, 12, 0, 'fist'),
        { headPitch: 6, headRoll: -5, nmm: 'happy' },
      ),
      kf(
        0.25,
        pose(22, -4, 54, 110, -55, 12, 0, 'fist'),
        pose(24, -4, 56, 112, -55, 12, 0, 'fist'),
        { headPitch: 5, nmm: 'happy' },
      ),
    ],
  ),

  GIVE: sign(
    'GIVE',
    'Actions',
    'Give',
    'Flattened pinched hand starts near chest and extends forward gracefully.',
    1.0,
    false,
    [
      kf(0.35, pose(32, 10, 28, 96, -80, 10, 0, 'pinch'), undefined, { nmm: 'neutral' }),
      kf(0.4, pose(48, 10, 8, 56, -85, 0, 0, 'flat_open'), undefined, {
        torsoLean: 3,
        nmm: 'neutral',
      }),
      kf(0.25, pose(46, 10, 8, 60, -85, 0, 0, 'flat_open'), undefined, { nmm: 'neutral' }),
    ],
  ),

  WAIT: sign(
    'WAIT',
    'Actions',
    'Wait / Hold on',
    'Both open upturned hands wiggle gently in front of the waist.',
    1.05,
    true,
    [
      kf(
        0.35,
        pose(32, 14, 12, 86, -80, -8, 0, 'spread'),
        pose(32, 14, 12, 86, -80, -8, 0, 'spread'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(34, 16, 10, 82, -85, -14, 6, 'spread'),
        pose(34, 16, 10, 82, -85, -14, 6, 'spread'),
        { nmm: 'neutral' },
      ),
      kf(
        0.3,
        pose(32, 14, 12, 86, -80, -8, 0, 'spread'),
        pose(32, 14, 12, 86, -80, -8, 0, 'spread'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  MEET: sign(
    'MEET',
    'Actions',
    'Meet',
    'Both upright index fingers move smoothly together until meeting at center.',
    1.05,
    true,
    [
      kf(
        0.35,
        pose(42, 22, 6, 86, 0, 0, 0, 'point'),
        pose(42, 22, 6, 86, 0, 0, 0, 'point'),
        { nmm: 'happy' },
      ),
      kf(
        0.4,
        pose(42, -2, 34, 92, 0, 0, 0, 'point'),
        pose(42, -2, 34, 92, 0, 0, 0, 'point'),
        { headPitch: 4, nmm: 'happy' },
      ),
      kf(
        0.25,
        pose(42, 0, 32, 92, 0, 0, 0, 'point'),
        pose(42, 0, 32, 92, 0, 0, 0, 'point'),
        { nmm: 'happy' },
      ),
    ],
  ),

  // ======================== PLACES ========================
  HOME: sign(
    'HOME',
    'Places',
    'Home / House',
    'Both flat hands angle diagonally so fingertips meet like a pitched roof.',
    1.15,
    true,
    [
      kf(
        0.3,
        pose(48, 12, 16, 94, 30, 0, 0, 'flat_closed'),
        pose(48, 12, 16, 94, 30, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.45,
        pose(56, 4, 28, 98, 25, 10, 0, 'flat_closed'),
        pose(56, 4, 28, 98, 25, 10, 0, 'flat_closed'),
        { headPitch: 2, nmm: 'happy' },
      ),
      kf(
        0.25,
        pose(54, 6, 26, 96, 25, 8, 0, 'flat_closed'),
        pose(54, 6, 26, 96, 25, 8, 0, 'flat_closed'),
        { nmm: 'happy' },
      ),
    ],
  ),

  SCHOOL: sign(
    'SCHOOL',
    'Places',
    'School / College',
    'Both flat palms clap gently together twice at center chest.',
    1.05,
    true,
    [
      kf(
        0.3,
        pose(36, 14, 18, 92, 0, 0, 0, 'flat_closed'),
        pose(36, 14, 18, 92, 0, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(36, 0, 34, 96, -15, 0, 0, 'flat_closed'),
        pose(36, 0, 34, 96, -15, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(36, 10, 22, 92, 0, 0, 0, 'flat_closed'),
        pose(36, 10, 22, 92, 0, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  HOSPITAL: sign(
    'HOSPITAL',
    'Places',
    'Hospital',
    'Index and middle fingers trace a medical cross on the left upper arm.',
    1.2,
    false,
    [
      kf(0.3, pose(38, -8, 48, 102, 45, 0, 0, 'n_two'), undefined, { nmm: 'neutral' }),
      kf(0.35, pose(26, -8, 48, 104, 45, 0, 0, 'n_two'), undefined, { nmm: 'neutral' }),
      kf(0.35, pose(32, -12, 54, 106, 45, 0, 0, 'n_two'), undefined, { nmm: 'neutral' }),
    ],
  ),

  INDIA: sign(
    'INDIA',
    'Places',
    'India',
    'Index finger touches the center of the forehead (bindi/tilak spot) respectfully.',
    1.05,
    false,
    [
      kf(0.35, pose(74, 10, 24, 114, -55, 8, 0, 'point'), undefined, { nmm: 'happy' }),
      kf(0.4, pose(76, 4, 28, 118, -55, 14, 0, 'point'), undefined, {
        headPitch: 4,
        nmm: 'happy',
      }),
      kf(0.25, pose(74, 8, 24, 114, -55, 8, 0, 'point'), undefined, { nmm: 'happy' }),
    ],
  ),

  OFFICE: sign(
    'OFFICE',
    'Places',
    'Office / Desk',
    'Both flat hands define the walls of a workspace enclosure in front of torso.',
    1.05,
    true,
    [
      kf(
        0.35,
        pose(38, 16, 10, 88, 0, 0, 0, 'flat_closed'),
        pose(38, 16, 10, 88, 0, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(38, 8, 22, 92, 65, 0, 0, 'flat_closed'),
        pose(38, 8, 22, 92, 65, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(38, 8, 22, 92, 65, 0, 0, 'flat_closed'),
        pose(38, 8, 22, 92, 65, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  // ======================== OBJECTS & NEEDS ========================
  WATER: sign(
    'WATER',
    'Objects & Needs',
    'Water',
    'W-handshape (three extended fingers) taps gently near the chin/lips twice.',
    1.05,
    false,
    [
      kf(0.35, pose(46, 10, 26, 120, -45, 0, 0, 'w_shape'), undefined, { nmm: 'neutral' }),
      kf(0.35, pose(48, 8, 28, 124, -45, 8, 0, 'w_shape'), undefined, {
        headPitch: 3,
        nmm: 'neutral',
      }),
      kf(0.3, pose(46, 10, 26, 120, -45, 0, 0, 'w_shape'), undefined, { nmm: 'neutral' }),
    ],
  ),

  FOOD: sign(
    'FOOD',
    'Objects & Needs',
    'Food / Meal',
    'Pinched hand taps toward the mouth clearly signifying food.',
    1.0,
    false,
    [
      kf(0.35, pose(44, 10, 24, 114, -55, 0, 0, 'pinch'), undefined, { nmm: 'neutral' }),
      kf(0.35, pose(48, 8, 28, 124, -65, 8, 0, 'pinch'), undefined, { nmm: 'neutral' }),
      kf(0.3, pose(44, 10, 24, 114, -55, 0, 0, 'pinch'), undefined, { nmm: 'neutral' }),
    ],
  ),

  BOOK: sign(
    'BOOK',
    'Objects & Needs',
    'Book',
    'Both palms begin pressed together and open outward like the pages of a book.',
    1.15,
    true,
    [
      kf(
        0.35,
        pose(36, 2, 34, 90, 0, 0, 0, 'flat_closed'),
        pose(36, 2, 34, 90, 0, 0, 0, 'flat_closed'),
        { headPitch: 6, nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(38, 12, 16, 86, -86, 0, 0, 'flat_closed'),
        pose(38, 12, 16, 86, -86, 0, 0, 'flat_closed'),
        { headPitch: 8, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(38, 12, 16, 86, -86, 0, 0, 'flat_closed'),
        pose(38, 12, 16, 86, -86, 0, 0, 'flat_closed'),
        { headPitch: 6, nmm: 'neutral' },
      ),
    ],
  ),

  PHONE: sign(
    'PHONE',
    'Objects & Needs',
    'Phone / Call',
    'Y-handshape (thumb and pinky extended) held beside the cheek and ear.',
    1.05,
    false,
    [
      kf(0.35, pose(58, 18, 8, 118, -55, 0, 0, 'y_shape'), undefined, {
        headRoll: 6,
        nmm: 'neutral',
      }),
      kf(0.4, pose(62, 16, 10, 122, -60, 4, 0, 'y_shape'), undefined, {
        headRoll: 8,
        nmm: 'neutral',
      }),
      kf(0.25, pose(60, 16, 10, 120, -58, 2, 0, 'y_shape'), undefined, {
        headRoll: 6,
        nmm: 'neutral',
      }),
    ],
  ),

  MONEY: sign(
    'MONEY',
    'Objects & Needs',
    'Money / Pay',
    'Thumb and fingers rub/tap against the open upturned left palm.',
    1.05,
    true,
    [
      kf(
        0.35,
        pose(38, 8, 28, 94, 70, 0, 0, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(32, 6, 34, 98, 70, 14, 0, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.3,
        pose(38, 8, 28, 94, 70, 4, 0, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  MEDICINE: sign(
    'MEDICINE',
    'Objects & Needs',
    'Medicine / Health',
    'Right middle fingertip touches and stirs softly in the center of the left palm.',
    1.1,
    true,
    [
      kf(
        0.35,
        pose(36, 8, 28, 92, 65, 10, 0, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { headPitch: 5, nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(32, 4, 34, 96, 55, 16, 8, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { headPitch: 6, nmm: 'neutral' },
      ),
      kf(
        0.3,
        pose(34, 8, 30, 94, 65, 12, -6, 'pinch'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { headPitch: 5, nmm: 'neutral' },
      ),
    ],
  ),

  LANGUAGE: sign(
    'LANGUAGE',
    'Objects & Needs',
    'Language / Sign Language',
    'Both L/F hands weave outward symmetrically in flowing alternating arcs.',
    1.2,
    true,
    [
      kf(
        0.3,
        pose(40, 4, 28, 90, 45, 0, 0, 'f_shape'),
        pose(40, 4, 28, 90, 45, 0, 0, 'f_shape'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(44, 18, 0, 82, 55, -8, 0, 'f_shape'),
        pose(44, 18, 0, 82, 55, -8, 0, 'f_shape'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(42, 24, -6, 80, 45, 6, 0, 'f_shape'),
        pose(42, 24, -6, 80, 45, 6, 0, 'f_shape'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  // ======================== EMOTIONS & MODIFIERS ========================
  HAPPY: sign(
    'HAPPY',
    'Emotions',
    'Happy / Glad',
    'Both flat palms brush lightly upward over the chest with a bright smile.',
    1.1,
    true,
    [
      kf(
        0.35,
        pose(22, 8, 36, 98, -50, 12, 0, 'flat_open'),
        pose(22, 8, 36, 98, -50, 12, 0, 'flat_open'),
        { nmm: 'happy' },
      ),
      kf(
        0.4,
        pose(36, 10, 32, 106, -55, 6, 0, 'flat_open'),
        pose(36, 10, 32, 106, -55, 6, 0, 'flat_open'),
        { headPitch: -3, nmm: 'happy' },
      ),
      kf(
        0.25,
        pose(30, 10, 34, 102, -55, 8, 0, 'flat_open'),
        pose(30, 10, 34, 102, -55, 8, 0, 'flat_open'),
        { nmm: 'happy' },
      ),
    ],
  ),

  SAD: sign(
    'SAD',
    'Emotions',
    'Sad / Upset',
    'Both spread hands draw slowly downward in front of the face as head lowers.',
    1.2,
    true,
    [
      kf(
        0.35,
        pose(62, 12, 14, 106, -80, 0, 0, 'flat_open'),
        pose(62, 12, 14, 106, -80, 0, 0, 'flat_open'),
        { headPitch: 6, nmm: 'sad' },
      ),
      kf(
        0.4,
        pose(42, 12, 14, 96, -80, 6, 0, 'flat_open'),
        pose(42, 12, 14, 96, -80, 6, 0, 'flat_open'),
        { headPitch: 14, nmm: 'sad' },
      ),
      kf(
        0.25,
        pose(40, 12, 14, 94, -80, 6, 0, 'flat_open'),
        pose(40, 12, 14, 94, -80, 6, 0, 'flat_open'),
        { headPitch: 14, nmm: 'sad' },
      ),
    ],
  ),

  GOOD: sign(
    'GOOD',
    'Modifiers',
    'Good / Fine / Well',
    'Thumb-up or flat hand moves smoothly forward from chin with an affirming smile.',
    1.0,
    false,
    [
      kf(0.35, pose(46, 10, 26, 118, -65, 4, 0, 'flat_closed'), undefined, {
        nmm: 'happy',
      }),
      kf(0.4, pose(50, 12, 10, 72, 0, 0, 0, 'thumb_up'), undefined, {
        headPitch: 6,
        nmm: 'happy',
      }),
      kf(0.25, pose(48, 12, 10, 70, 0, 0, 0, 'thumb_up'), undefined, { nmm: 'happy' }),
    ],
  ),

  BAD: sign(
    'BAD',
    'Modifiers',
    'Bad / Wrong',
    'Flat hand at chin flips palm-downward sharply with a slight head shake.',
    1.0,
    false,
    [
      kf(0.35, pose(46, 10, 26, 118, -70, 0, 0, 'flat_closed'), undefined, { nmm: 'negative' }),
      kf(0.4, pose(42, 14, 6, 76, 85, 16, 0, 'flat_closed'), undefined, {
        headYaw: 8,
        nmm: 'negative',
      }),
      kf(0.25, pose(40, 14, 6, 74, 85, 16, 0, 'flat_closed'), undefined, {
        headYaw: -6,
        nmm: 'negative',
      }),
    ],
  ),

  MORE: sign(
    'MORE',
    'Modifiers',
    'More / Extra',
    'Both pinched hands tap together at fingertips in front of the chest.',
    1.0,
    true,
    [
      kf(
        0.35,
        pose(38, 12, 18, 92, -30, 0, 0, 'pinch'),
        pose(38, 12, 18, 92, -30, 0, 0, 'pinch'),
        { nmm: 'neutral' },
      ),
      kf(
        0.35,
        pose(38, 0, 34, 96, -30, 6, 0, 'pinch'),
        pose(38, 0, 34, 96, -30, 6, 0, 'pinch'),
        { nmm: 'neutral' },
      ),
      kf(
        0.3,
        pose(38, 10, 22, 92, -30, 0, 0, 'pinch'),
        pose(38, 10, 22, 92, -30, 0, 0, 'pinch'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  BIG: sign(
    'BIG',
    'Modifiers',
    'Big / Large',
    'Both L/flat hands expand wide apart to show large size.',
    1.05,
    true,
    [
      kf(
        0.3,
        pose(38, 4, 24, 90, 0, 0, 0, 'flat_open'),
        pose(38, 4, 24, 90, 0, 0, 0, 'flat_open'),
        { nmm: 'neutral' },
      ),
      kf(
        0.45,
        pose(42, 34, -18, 76, 0, 0, 0, 'flat_open'),
        pose(42, 34, -18, 76, 0, 0, 0, 'flat_open'),
        { headPitch: -3, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(42, 32, -16, 78, 0, 0, 0, 'flat_open'),
        pose(42, 32, -16, 78, 0, 0, 0, 'flat_open'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  SMALL: sign(
    'SMALL',
    'Modifiers',
    'Small / Little',
    'Both flat palms face each other closely in front of the chest.',
    1.0,
    true,
    [
      kf(
        0.35,
        pose(38, 14, 16, 90, 0, 0, 0, 'flat_closed'),
        pose(38, 14, 16, 90, 0, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
      kf(
        0.4,
        pose(38, 2, 30, 94, 0, 0, 0, 'flat_closed'),
        pose(38, 2, 30, 94, 0, 0, 0, 'flat_closed'),
        { headPitch: 4, nmm: 'neutral' },
      ),
      kf(
        0.25,
        pose(38, 2, 30, 94, 0, 0, 0, 'flat_closed'),
        pose(38, 2, 30, 94, 0, 0, 0, 'flat_closed'),
        { nmm: 'neutral' },
      ),
    ],
  ),

  STOP: sign(
    'STOP',
    'Actions',
    'Stop',
    'Edge of right flat palm strikes down firmly onto the upturned left palm.',
    0.95,
    true,
    [
      kf(
        0.35,
        pose(48, 8, 24, 92, 0, -10, 0, 'flat_closed'),
        pose(32, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { nmm: 'urgent' },
      ),
      kf(
        0.4,
        pose(34, 6, 32, 94, 0, 8, 0, 'flat_closed'),
        pose(32, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { headPitch: 5, nmm: 'urgent' },
      ),
      kf(
        0.25,
        pose(34, 6, 32, 94, 0, 8, 0, 'flat_closed'),
        pose(32, 8, 34, 90, -85, 0, 0, 'flat_closed'),
        { nmm: 'urgent' },
      ),
    ],
  ),

  FINISH: sign(
    'FINISH',
    'Modifiers',
    'Done / Finished / Already',
    'Both open hands flick outward from wrists indicating completion.',
    0.95,
    true,
    [
      kf(
        0.35,
        pose(42, 12, 22, 94, -45, 0, 0, 'spread'),
        pose(42, 12, 22, 94, -45, 0, 0, 'spread'),
        { nmm: 'affirmative' },
      ),
      kf(
        0.4,
        pose(40, 26, -10, 76, 85, -14, 0, 'spread'),
        pose(40, 26, -10, 76, 85, -14, 0, 'spread'),
        { headPitch: 6, nmm: 'affirmative' },
      ),
      kf(
        0.25,
        pose(40, 26, -10, 76, 85, -14, 0, 'spread'),
        pose(40, 26, -10, 76, 85, -14, 0, 'spread'),
        { nmm: 'affirmative' },
      ),
    ],
  ),

  // ======================== TWO-HANDED & STANDARD ISL FINGERSPELLING A-Z + 0-9 ========================
  // In Indian Sign Language (ISL), fingerspelling uses a rich two-handed manual alphabet.
  FS_A: sign(
    'A',
    'Fingerspelling',
    'Letter A',
    'ISL two-handed vowel A: right index touches the tip of the left thumb.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 8, 28, 96, 40, 10, 0, 'point'),
        pose(38, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
      kf(
        0.5,
        pose(38, 6, 32, 98, 40, 14, 0, 'point'),
        pose(38, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
    ],
  ),
  FS_B: sign(
    'B',
    'Fingerspelling',
    'Letter B',
    'ISL B: thumb and index of both hands form twin circles meeting at center.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(42, 2, 28, 94, 0, 0, 0, 'ok'),
        pose(42, 2, 28, 94, 0, 0, 0, 'ok'),
      ),
      kf(
        0.5,
        pose(42, 0, 30, 96, 0, 0, 0, 'ok'),
        pose(42, 0, 30, 96, 0, 0, 0, 'ok'),
      ),
    ],
  ),
  FS_C: sign(
    'C',
    'Fingerspelling',
    'Letter C',
    'ISL C: right thumb and index curve into a clear C-arc facing forward.',
    0.7,
    false,
    [
      kf(0.5, pose(46, 16, 12, 94, 15, 0, 0, 'c_shape')),
      kf(0.5, pose(46, 16, 12, 94, 15, 0, 0, 'c_shape')),
    ],
  ),
  FS_D: sign(
    'D',
    'Fingerspelling',
    'Letter D',
    'ISL D: right curved index-thumb D meets the upright left index finger.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(42, 4, 28, 94, 10, 0, 0, 'c_shape'),
        pose(40, 8, 30, 96, 0, 0, 0, 'point'),
      ),
      kf(
        0.5,
        pose(42, 2, 30, 96, 10, 0, 0, 'c_shape'),
        pose(40, 8, 30, 96, 0, 0, 0, 'point'),
      ),
    ],
  ),
  FS_E: sign(
    'E',
    'Fingerspelling',
    'Letter E',
    'ISL two-handed vowel E: right index touches the tip of the left index finger.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(44, 8, 28, 96, 40, 8, 0, 'point'),
        pose(40, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
      kf(
        0.5,
        pose(42, 6, 32, 98, 40, 12, 0, 'point'),
        pose(40, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
    ],
  ),
  FS_F: sign(
    'F',
    'Fingerspelling',
    'Letter F',
    'ISL F: right index and middle fingers rest across the left index and middle fingers.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 6, 28, 94, 55, 0, 0, 'n_two'),
        pose(38, 8, 32, 92, 0, 0, 0, 'n_two'),
      ),
      kf(
        0.5,
        pose(38, 4, 32, 96, 55, 8, 0, 'n_two'),
        pose(38, 8, 32, 92, 0, 0, 0, 'n_two'),
      ),
    ],
  ),
  FS_G: sign(
    'G',
    'Fingerspelling',
    'Letter G',
    'ISL G: right fist rests cleanly on top of the left fist.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(42, 4, 32, 96, 20, 0, 0, 'fist'),
        pose(32, 6, 36, 94, 20, 0, 0, 'fist'),
      ),
      kf(
        0.5,
        pose(40, 4, 34, 96, 20, 0, 0, 'fist'),
        pose(32, 6, 36, 94, 20, 0, 0, 'fist'),
      ),
    ],
  ),
  FS_H: sign(
    'H',
    'Fingerspelling',
    'Letter H',
    'ISL H: right flat palm sweeps smoothly across the upturned left palm.',
    0.75,
    true,
    [
      kf(
        0.5,
        pose(36, 10, 30, 94, 80, 0, 0, 'flat_closed'),
        pose(32, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(44, 6, 20, 76, 80, 0, 0, 'flat_closed'),
        pose(32, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
    ],
  ),
  FS_I: sign(
    'I',
    'Fingerspelling',
    'Letter I',
    'ISL two-handed vowel I: right index touches the tip of the left middle finger.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(42, 6, 30, 96, 40, 10, 0, 'point'),
        pose(40, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
      kf(
        0.5,
        pose(40, 4, 34, 98, 40, 14, 0, 'point'),
        pose(40, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
    ],
  ),
  FS_J: sign(
    'J',
    'Fingerspelling',
    'Letter J',
    'ISL J: right index finger traces a J-curve across the upturned left palm.',
    0.75,
    true,
    [
      kf(
        0.5,
        pose(44, 8, 28, 94, 55, 0, 0, 'point'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(34, 4, 36, 98, 55, 16, 0, 'point'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
    ],
  ),
  FS_K: sign(
    'K',
    'Fingerspelling',
    'Letter K',
    'ISL K: hooked right index finger rests against the upright left index finger.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(42, 4, 28, 96, 25, 15, 0, 'point'),
        pose(40, 8, 30, 94, 0, 0, 0, 'point'),
      ),
      kf(
        0.5,
        pose(42, 2, 30, 96, 25, 18, 0, 'point'),
        pose(40, 8, 30, 94, 0, 0, 0, 'point'),
      ),
    ],
  ),
  FS_L: sign(
    'L',
    'Fingerspelling',
    'Letter L',
    'ISL L: right index finger rests centered across the open left palm.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(38, 6, 30, 94, 65, 8, 0, 'point'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(36, 4, 34, 96, 65, 12, 0, 'point'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
    ],
  ),
  FS_M: sign(
    'M',
    'Fingerspelling',
    'Letter M',
    'ISL M: three right fingers (index, middle, ring) rest gently on the left palm.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(38, 6, 30, 94, 70, 8, 0, 'm_three'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(36, 4, 34, 96, 70, 12, 0, 'm_three'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
    ],
  ),
  FS_N: sign(
    'N',
    'Fingerspelling',
    'Letter N',
    'ISL N: two right fingers (index and middle) rest gently on the left palm.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(38, 6, 30, 94, 70, 8, 0, 'n_two'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(36, 4, 34, 96, 70, 12, 0, 'n_two'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
    ],
  ),
  FS_O: sign(
    'O',
    'Fingerspelling',
    'Letter O',
    'ISL two-handed vowel O: right index touches the tip of the left ring finger.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 6, 32, 96, 40, 10, 0, 'point'),
        pose(40, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
      kf(
        0.5,
        pose(38, 4, 36, 98, 40, 14, 0, 'point'),
        pose(40, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
    ],
  ),
  FS_P: sign(
    'P',
    'Fingerspelling',
    'Letter P',
    'ISL P: right thumb and index form a loop touching the tip of the left index.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(44, 4, 28, 94, 15, 0, 0, 'ok'),
        pose(40, 8, 30, 94, 0, 0, 0, 'point'),
      ),
      kf(
        0.5,
        pose(44, 2, 30, 96, 15, 0, 0, 'ok'),
        pose(40, 8, 30, 94, 0, 0, 0, 'point'),
      ),
    ],
  ),
  FS_Q: sign(
    'Q',
    'Fingerspelling',
    'Letter Q',
    'ISL Q: left thumb and index form a circle while right index hooks into it.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 4, 30, 96, 45, 10, 0, 'point'),
        pose(40, 6, 32, 94, 0, 0, 0, 'ok'),
      ),
      kf(
        0.5,
        pose(40, 2, 32, 98, 45, 14, 0, 'point'),
        pose(40, 6, 32, 94, 0, 0, 0, 'ok'),
      ),
    ],
  ),
  FS_R: sign(
    'R',
    'Fingerspelling',
    'Letter R',
    'ISL R: curved right index finger rests across the open left palm.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(38, 6, 30, 94, 60, 12, 0, 'r_cross'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(36, 4, 34, 96, 60, 14, 0, 'r_cross'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
    ],
  ),
  FS_S: sign(
    'S',
    'Fingerspelling',
    'Letter S',
    'ISL S: right and left pinky fingers link gently together in front of chest.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 4, 30, 94, 25, 0, 0, 'i_pinky'),
        pose(40, 4, 30, 94, -35, 0, 0, 'i_pinky'),
      ),
      kf(
        0.5,
        pose(38, 2, 32, 96, 25, 6, 0, 'i_pinky'),
        pose(38, 2, 32, 96, -35, 6, 0, 'i_pinky'),
      ),
    ],
  ),
  FS_T: sign(
    'T',
    'Fingerspelling',
    'Letter T',
    'ISL T: right index finger touches the outer edge of the upright left palm.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 6, 30, 94, 55, 0, 0, 'point'),
        pose(38, 8, 32, 92, 0, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(40, 4, 34, 96, 55, 6, 0, 'point'),
        pose(38, 8, 32, 92, 0, 0, 0, 'flat_closed'),
      ),
    ],
  ),
  FS_U: sign(
    'U',
    'Fingerspelling',
    'Letter U',
    'ISL two-handed vowel U: right index touches the tip of the left pinky finger.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(38, 6, 32, 96, 40, 12, 0, 'point'),
        pose(40, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
      kf(
        0.5,
        pose(36, 4, 36, 98, 40, 16, 0, 'point'),
        pose(40, 10, 30, 94, -45, 0, 0, 'flat_open'),
      ),
    ],
  ),
  FS_V: sign(
    'V',
    'Fingerspelling',
    'Letter V',
    'ISL V: right V-fingers rest cleanly on the upturned left palm.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 8, 28, 94, 45, 0, 0, 'v_shape'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(38, 6, 32, 96, 45, 6, 0, 'v_shape'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
    ],
  ),
  FS_W: sign(
    'W',
    'Fingerspelling',
    'Letter W',
    'ISL W: fingers of both open hands interlock lightly at chest height.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 6, 28, 94, 35, 0, 0, 'flat_open'),
        pose(40, 6, 28, 94, 35, 0, 0, 'flat_open'),
      ),
      kf(
        0.5,
        pose(40, 2, 34, 96, 35, 6, 0, 'flat_open'),
        pose(40, 2, 34, 96, 35, 6, 0, 'flat_open'),
      ),
    ],
  ),
  FS_X: sign(
    'X',
    'Fingerspelling',
    'Letter X',
    'ISL X: right index finger crosses over the left index finger in an X shape.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(42, 4, 32, 96, 45, 0, 0, 'point'),
        pose(42, 4, 32, 96, -35, 0, 0, 'point'),
      ),
      kf(
        0.5,
        pose(42, 2, 34, 98, 45, 4, 0, 'point'),
        pose(42, 2, 34, 98, -35, 4, 0, 'point'),
      ),
    ],
  ),
  FS_Y: sign(
    'Y',
    'Fingerspelling',
    'Letter Y',
    'ISL Y: right index finger rests in the web between the left thumb and index.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(40, 8, 30, 94, 45, 0, 0, 'point'),
        pose(38, 10, 32, 92, 0, 0, 0, 'l_shape'),
      ),
      kf(
        0.5,
        pose(38, 6, 34, 96, 45, 6, 0, 'point'),
        pose(38, 10, 32, 92, 0, 0, 0, 'l_shape'),
      ),
    ],
  ),
  FS_Z: sign(
    'Z',
    'Fingerspelling',
    'Letter Z',
    'ISL Z: right flat hand rests perpendicularly against the upturned left palm.',
    0.7,
    true,
    [
      kf(
        0.5,
        pose(42, 6, 28, 94, 0, 0, 0, 'flat_closed'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
      kf(
        0.5,
        pose(40, 4, 32, 96, 0, 8, 0, 'flat_closed'),
        pose(34, 8, 34, 90, -85, 0, 0, 'flat_closed'),
      ),
    ],
  ),

  // Digits 0-9
  FS_0: sign('0', 'Fingerspelling', 'Number 0', 'Fingers form a clear O/zero loop.', 0.7, false, [
    kf(1.0, pose(46, 16, 10, 94, 15, 0, 0, 'ok')),
  ]),
  FS_1: sign('1', 'Fingerspelling', 'Number 1', 'Index finger held upright.', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'point')),
  ]),
  FS_2: sign('2', 'Fingerspelling', 'Number 2', 'Index and middle fingers extended.', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'v_shape')),
  ]),
  FS_3: sign('3', 'Fingerspelling', 'Number 3', 'Three fingers extended cleanly.', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'w_shape')),
  ]),
  FS_4: sign('4', 'Fingerspelling', 'Number 4', 'Four fingers open, thumb tucked.', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'flat_open')),
  ]),
  FS_5: sign('5', 'Fingerspelling', 'Number 5', 'All five fingers spread clearly.', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'spread')),
  ]),
  FS_6: sign('6', 'Fingerspelling', 'Number 6', 'Pinky extended outward.', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'i_pinky')),
  ]),
  FS_7: sign('7', 'Fingerspelling', 'Number 7', 'Seven handshape held forward.', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'l_shape')),
  ]),
  FS_8: sign('8', 'Fingerspelling', 'Number 8', 'Eight handshape (3-finger + thumb).', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'f_shape')),
  ]),
  FS_9: sign('9', 'Fingerspelling', 'Number 9', 'Nine / F-loop handshape.', 0.65, false, [
    kf(1.0, pose(46, 16, 10, 96, 80, 0, 0, 'ok')),
  ]),
};

export const LEXICON_GLOSS_LIST = Object.keys(ISL_LEXICON);
export const VOCAB_GLOSS_LIST = Object.values(ISL_LEXICON)
  .filter((s) => s.category !== 'Fingerspelling')
  .map((s) => s.gloss);
