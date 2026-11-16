import * as THREE from 'three';
import { HANDSHAPE_POSES, type HandshapePose } from '../data/handshapes';
import { REST_ARM_POSE } from '../data/islLexicon';
import type { ArmPose, FingerKey, NMMType, SignKeyframe } from '../types/isl';
import { createFabricTexture, createSkinTexture } from './proceduralTextures';

const DEG2RAD = Math.PI / 180;

interface FingerJointRig {
  mcp: THREE.Group;
  pip: THREE.Group;
  dip: THREE.Group;
}

interface ThumbRig {
  abductGroup: THREE.Group;
  opposeGroup: THREE.Group;
  mcp: THREE.Group;
  ip: THREE.Group;
}

interface ArmRig {
  sideSign: -1 | 1; // -1 = Right (-X), +1 = Left (+X)
  shoulderPitch: THREE.Group;
  shoulderRoll: THREE.Group;
  shoulderYaw: THREE.Group;
  elbow: THREE.Group;
  forearm: THREE.Group;
  wristFlex: THREE.Group;
  wristTilt: THREE.Group;
  thumb: ThumbRig;
  fingers: Record<'index' | 'middle' | 'ring' | 'pinky', FingerJointRig>;
}

interface InternalArmState {
  shoulderForward: number;
  shoulderOut: number;
  shoulderTwist: number;
  elbowFlex: number;
  forearmPronation: number;
  wristFlex: number;
  wristTilt: number;
  hand: HandshapePose;
}

function cloneHandshapePose(pose: HandshapePose): HandshapePose {
  return {
    thumb: { ...pose.thumb },
    index: { ...pose.index },
    middle: { ...pose.middle },
    ring: { ...pose.ring },
    pinky: { ...pose.pinky },
  };
}

function createInitialArmState(): InternalArmState {
  return {
    ...REST_ARM_POSE,
    hand: cloneHandshapePose(HANDSHAPE_POSES.neutral),
  };
}

export class ISLAvatar {
  public readonly root: THREE.Group;
  private readonly torsoGroup: THREE.Group;
  private readonly chestMesh: THREE.Mesh;
  private readonly neckGroup: THREE.Group;
  private readonly headGroup: THREE.Group;
  private readonly leftBrow: THREE.Group;
  private readonly rightBrow: THREE.Group;
  private readonly leftEyelid: THREE.Mesh;
  private readonly rightEyelid: THREE.Mesh;
  private readonly mouthMesh: THREE.Mesh;

  private readonly rightArm: ArmRig;
  private readonly leftArm: ArmRig;

  private readonly currentRight: InternalArmState = createInitialArmState();
  private readonly currentLeft: InternalArmState = createInitialArmState();
  private currentHeadPitch = 0;
  private currentHeadYaw = 0;
  private currentHeadRoll = 0;
  private currentTorsoLean = 0;
  private currentTorsoTwist = 0;
  private currentBrowRaise = 0;
  private currentBrowFurrow = 0;
  private currentSmile = 0.15;

  private blinkTimer = 2.4;
  private blinkAmount = 0;
  private elapsed = 0;

  private readonly disposables: Array<{ dispose: () => void }> = [];

  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'ISLAvatarRoot';

    const skinTex = createSkinTexture('#c98c68');
    const fabricTex = createFabricTexture('#23324a', '#2f4363');
    const trouserTex = createFabricTexture('#151d2e', '#1e293b');
    this.disposables.push(skinTex, fabricTex, trouserTex);

    const skinMat = new THREE.MeshStandardMaterial({
      map: skinTex,
      roughness: 0.56,
      metalness: 0.02,
    });
    const palmInnerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d29a79'),
      roughness: 0.62,
      metalness: 0.02,
    });
    const tunicMat = new THREE.MeshStandardMaterial({
      map: fabricTex,
      roughness: 0.78,
      metalness: 0.04,
    });
    const collarTrimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3b5173'),
      roughness: 0.68,
      metalness: 0.06,
    });
    const trouserMat = new THREE.MeshStandardMaterial({
      map: trouserTex,
      roughness: 0.85,
      metalness: 0.03,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#191b22'),
      roughness: 0.72,
      metalness: 0.08,
    });
    const browMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1c1917'),
      roughness: 0.7,
      metalness: 0.04,
    });
    const scleraMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.28,
      metalness: 0.0,
    });
    const irisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3b2318'),
      roughness: 0.22,
      metalness: 0.05,
    });
    const pupilMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#09090b'),
      roughness: 0.15,
      metalness: 0.05,
    });
    const lipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#9f5d52'),
      roughness: 0.48,
      metalness: 0.02,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f172a'),
      roughness: 0.45,
      metalness: 0.12,
    });

    this.disposables.push(
      skinMat,
      palmInnerMat,
      tunicMat,
      collarTrimMat,
      trouserMat,
      hairMat,
      browMat,
      scleraMat,
      irisMat,
      pupilMat,
      lipMat,
      shoeMat,
    );

    // ======================== LOWER BODY (Grounded at y = 0) ========================
    this.buildLowerBody(trouserMat, shoeMat);

    // ======================== TORSO & TUNIC ========================
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.94, 0);
    this.root.add(this.torsoGroup);

    // Sculpted waist-to-shoulder torso via LatheGeometry
    const torsoProfile = [
      new THREE.Vector2(0.01, -0.04),
      new THREE.Vector2(0.145, -0.02),
      new THREE.Vector2(0.138, 0.08),
      new THREE.Vector2(0.145, 0.22),
      new THREE.Vector2(0.172, 0.36),
      new THREE.Vector2(0.184, 0.46),
      new THREE.Vector2(0.135, 0.51),
      new THREE.Vector2(0.068, 0.53),
      new THREE.Vector2(0.01, 0.53),
    ];
    const torsoGeo = new THREE.LatheGeometry(torsoProfile, 28);
    torsoGeo.scale(1.08, 1.0, 0.68);
    this.disposables.push(torsoGeo);

    this.chestMesh = new THREE.Mesh(torsoGeo, tunicMat);
    this.chestMesh.castShadow = true;
    this.chestMesh.receiveShadow = true;
    this.torsoGroup.add(this.chestMesh);

    // Tunic lower hem skirt (covers hip transition cleanly)
    const hemGeo = new THREE.CylinderGeometry(0.148, 0.168, 0.22, 24);
    hemGeo.scale(1.06, 1, 0.72);
    this.disposables.push(hemGeo);
    const hemMesh = new THREE.Mesh(hemGeo, tunicMat);
    hemMesh.position.set(0, -0.06, 0);
    hemMesh.castShadow = true;
    hemMesh.receiveShadow = true;
    this.torsoGroup.add(hemMesh);

    // Mandarin collar & placket trim
    const collarGeo = new THREE.CylinderGeometry(0.068, 0.074, 0.045, 24, 1, true);
    this.disposables.push(collarGeo);
    const collarMesh = new THREE.Mesh(collarGeo, collarTrimMat);
    collarMesh.position.set(0, 0.535, 0.005);
    this.torsoGroup.add(collarMesh);

    const placketGeo = new THREE.BoxGeometry(0.028, 0.17, 0.012);
    this.disposables.push(placketGeo);
    const placketMesh = new THREE.Mesh(placketGeo, collarTrimMat);
    placketMesh.position.set(0, 0.435, 0.118);
    placketMesh.rotation.x = -0.14;
    this.torsoGroup.add(placketMesh);

    // ======================== NECK & HEAD ========================
    this.neckGroup = new THREE.Group();
    this.neckGroup.position.set(0, 0.535, 0.005);
    this.torsoGroup.add(this.neckGroup);

    const neckGeo = new THREE.CylinderGeometry(0.052, 0.059, 0.105, 20);
    this.disposables.push(neckGeo);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 0.04, 0);
    neckMesh.castShadow = true;
    this.neckGroup.add(neckMesh);

    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.1, 0.006);
    this.neckGroup.add(this.headGroup);

    const { leftBrow, rightBrow, leftEyelid, rightEyelid, mouthMesh } = this.buildHead(
      skinMat,
      hairMat,
      browMat,
      scleraMat,
      irisMat,
      pupilMat,
      lipMat,
    );
    this.leftBrow = leftBrow;
    this.rightBrow = rightBrow;
    this.leftEyelid = leftEyelid;
    this.rightEyelid = rightEyelid;
    this.mouthMesh = mouthMesh;

    // ======================== ARTICULATED ARMS & HANDS ========================
    this.rightArm = this.buildArm(-1, tunicMat, collarTrimMat, skinMat, palmInnerMat);
    this.leftArm = this.buildArm(1, tunicMat, collarTrimMat, skinMat, palmInnerMat);

    // Apply initial rest pose immediately
    this.applyRigTransforms();
  }

  private buildLowerBody(trouserMat: THREE.Material, shoeMat: THREE.Material) {
    const pelvisGeo = new THREE.CylinderGeometry(0.148, 0.142, 0.16, 22);
    pelvisGeo.scale(1.04, 1, 0.72);
    this.disposables.push(pelvisGeo);
    const pelvis = new THREE.Mesh(pelvisGeo, trouserMat);
    pelvis.position.set(0, 0.87, 0);
    pelvis.castShadow = true;
    pelvis.receiveShadow = true;
    this.root.add(pelvis);

    const thighGeo = new THREE.CylinderGeometry(0.072, 0.056, 0.42, 18);
    const calfGeo = new THREE.CylinderGeometry(0.054, 0.04, 0.41, 18);
    const shoeGeo = new THREE.CapsuleGeometry(0.036, 0.11, 8, 14);
    shoeGeo.rotateX(Math.PI / 2);
    shoeGeo.scale(1.12, 0.78, 1.0);
    this.disposables.push(thighGeo, calfGeo, shoeGeo);

    ([-1, 1] as const).forEach((side) => {
      const x = side * 0.092;

      const thigh = new THREE.Mesh(thighGeo, trouserMat);
      thigh.position.set(x, 0.63, 0);
      thigh.castShadow = true;
      thigh.receiveShadow = true;
      this.root.add(thigh);

      const calf = new THREE.Mesh(calfGeo, trouserMat);
      calf.position.set(x, 0.24, 0);
      calf.castShadow = true;
      calf.receiveShadow = true;
      this.root.add(calf);

      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(x, 0.03, 0.04);
      shoe.castShadow = true;
      shoe.receiveShadow = true;
      this.root.add(shoe);
    });
  }

  private buildHead(
    skinMat: THREE.Material,
    hairMat: THREE.Material,
    browMat: THREE.Material,
    scleraMat: THREE.Material,
    irisMat: THREE.Material,
    pupilMat: THREE.Material,
    lipMat: THREE.Material,
  ) {
    // Sculpted human head (lathe profile scaled slightly deeper & narrower for natural jawline)
    const headProfile = [
      new THREE.Vector2(0.001, -0.025),
      new THREE.Vector2(0.042, -0.015),
      new THREE.Vector2(0.076, 0.03),
      new THREE.Vector2(0.089, 0.095),
      new THREE.Vector2(0.088, 0.145),
      new THREE.Vector2(0.074, 0.195),
      new THREE.Vector2(0.044, 0.222),
      new THREE.Vector2(0.001, 0.228),
    ];
    const headGeo = new THREE.LatheGeometry(headProfile, 28);
    headGeo.scale(0.94, 1.0, 1.06);
    this.disposables.push(headGeo);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    this.headGroup.add(headMesh);

    // Subtle jaw / chin refinement
    const chinGeo = new THREE.SphereGeometry(0.032, 16, 14);
    chinGeo.scale(1.05, 0.82, 0.9);
    this.disposables.push(chinGeo);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, 0.002, 0.056);
    this.headGroup.add(chin);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.022, 12, 12);
    earGeo.scale(0.45, 1.25, 0.72);
    this.disposables.push(earGeo);
    ([-1, 1] as const).forEach((side) => {
      const ear = new THREE.Mesh(earGeo, skinMat);
      ear.position.set(side * 0.086, 0.095, -0.005);
      ear.rotation.z = side * -0.14;
      this.headGroup.add(ear);
    });

    // Nose bridge + tip
    const noseGeo = new THREE.CapsuleGeometry(0.01, 0.032, 6, 10);
    this.disposables.push(noseGeo);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, 0.086, 0.09);
    nose.rotation.x = -0.26;
    this.headGroup.add(nose);

    const noseTipGeo = new THREE.SphereGeometry(0.013, 12, 10);
    this.disposables.push(noseTipGeo);
    const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
    noseTip.position.set(0, 0.068, 0.098);
    this.headGroup.add(noseTip);

    // Hair cap & soft front wave
    const hairCapGeo = new THREE.SphereGeometry(0.094, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62);
    hairCapGeo.scale(0.96, 1.04, 1.09);
    this.disposables.push(hairCapGeo);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.125, -0.012);
    hairCap.rotation.x = -0.18;
    hairCap.castShadow = true;
    this.headGroup.add(hairCap);

    const hairBackGeo = new THREE.SphereGeometry(0.086, 20, 14);
    hairBackGeo.scale(0.95, 1.0, 0.92);
    this.disposables.push(hairBackGeo);
    const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
    hairBack.position.set(0, 0.115, -0.025);
    this.headGroup.add(hairBack);

    const hairFrontGeo = new THREE.CapsuleGeometry(0.022, 0.088, 8, 12);
    hairFrontGeo.rotateZ(Math.PI / 2);
    this.disposables.push(hairFrontGeo);
    const hairFront = new THREE.Mesh(hairFrontGeo, hairMat);
    hairFront.position.set(0.01, 0.194, 0.048);
    hairFront.rotation.y = -0.18;
    hairFront.rotation.z = -0.1;
    this.headGroup.add(hairFront);

    // Eyes (with blinkable upper eyelids)
    const eyeGeo = new THREE.SphereGeometry(0.0135, 14, 12);
    const irisGeo = new THREE.SphereGeometry(0.0082, 12, 10);
    const pupilGeo = new THREE.SphereGeometry(0.0046, 10, 10);
    const lidGeo = new THREE.SphereGeometry(0.0148, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52);
    this.disposables.push(eyeGeo, irisGeo, pupilGeo, lidGeo);

    const createEye = (x: number) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(x, 0.112, 0.077);

      const sclera = new THREE.Mesh(eyeGeo, scleraMat);
      sclera.scale.set(1.12, 0.85, 0.72);
      eyeGroup.add(sclera);

      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.set(0, 0, 0.0068);
      iris.scale.set(1.0, 1.0, 0.55);
      eyeGroup.add(iris);

      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0, 0.0092);
      pupil.scale.set(1.0, 1.0, 0.5);
      eyeGroup.add(pupil);

      const lid = new THREE.Mesh(lidGeo, skinMat);
      lid.scale.set(1.14, 0.95, 0.78);
      lid.rotation.x = -0.6;
      eyeGroup.add(lid);

      this.headGroup.add(eyeGroup);
      return lid;
    };

    const rightEyelid = createEye(-0.032);
    const leftEyelid = createEye(0.032);

    // Expressive Eyebrows (pivoted for NMM raise & furrow)
    const browGeo = new THREE.CapsuleGeometry(0.0042, 0.026, 6, 10);
    browGeo.rotateZ(Math.PI / 2);
    this.disposables.push(browGeo);

    const rightBrow = new THREE.Group();
    rightBrow.position.set(-0.032, 0.136, 0.084);
    const rightBrowMesh = new THREE.Mesh(browGeo, browMat);
    rightBrowMesh.rotation.y = -0.18;
    rightBrow.add(rightBrowMesh);
    this.headGroup.add(rightBrow);

    const leftBrow = new THREE.Group();
    leftBrow.position.set(0.032, 0.136, 0.084);
    const leftBrowMesh = new THREE.Mesh(browGeo, browMat);
    leftBrowMesh.rotation.y = 0.18;
    leftBrow.add(leftBrowMesh);
    this.headGroup.add(leftBrow);

    // Expressive Mouth
    const mouthGeo = new THREE.CapsuleGeometry(0.0048, 0.032, 6, 12);
    mouthGeo.rotateZ(Math.PI / 2);
    this.disposables.push(mouthGeo);
    const mouthMesh = new THREE.Mesh(mouthGeo, lipMat);
    mouthMesh.position.set(0, 0.034, 0.084);
    this.headGroup.add(mouthMesh);

    return { leftBrow, rightBrow, leftEyelid, rightEyelid, mouthMesh };
  }

  private buildArm(
    sideSign: -1 | 1,
    tunicMat: THREE.Material,
    cuffMat: THREE.Material,
    skinMat: THREE.Material,
    palmInnerMat: THREE.Material,
  ): ArmRig {
    const shoulderX = sideSign * 0.205;
    const upperArmLen = 0.285;
    const forearmLen = 0.255;

    const shoulderPitch = new THREE.Group();
    shoulderPitch.position.set(shoulderX, 0.455, 0.0);
    this.torsoGroup.add(shoulderPitch);

    const shoulderRoll = new THREE.Group();
    shoulderPitch.add(shoulderRoll);

    const shoulderYaw = new THREE.Group();
    shoulderRoll.add(shoulderYaw);

    // Shoulder deltoid cap (sleeve fabric)
    const deltoidGeo = new THREE.SphereGeometry(0.056, 16, 14);
    this.disposables.push(deltoidGeo);
    const deltoid = new THREE.Mesh(deltoidGeo, tunicMat);
    deltoid.castShadow = true;
    shoulderYaw.add(deltoid);

    // Upper arm sleeve
    const upperArmGeo = new THREE.CylinderGeometry(0.052, 0.044, upperArmLen, 18);
    this.disposables.push(upperArmGeo);
    const upperArmMesh = new THREE.Mesh(upperArmGeo, tunicMat);
    upperArmMesh.position.set(0, -upperArmLen / 2, 0);
    upperArmMesh.castShadow = true;
    upperArmMesh.receiveShadow = true;
    shoulderYaw.add(upperArmMesh);

    // Elbow cuff band (3/4 sleeve cuff above skin forearm for clear sign visibility)
    const cuffGeo = new THREE.CylinderGeometry(0.047, 0.048, 0.036, 18);
    this.disposables.push(cuffGeo);
    const cuff = new THREE.Mesh(cuffGeo, cuffMat);
    cuff.position.set(0, -upperArmLen + 0.015, 0);
    shoulderYaw.add(cuff);

    // Elbow pivot
    const elbow = new THREE.Group();
    elbow.position.set(0, -upperArmLen, 0);
    shoulderYaw.add(elbow);

    const elbowCapGeo = new THREE.SphereGeometry(0.038, 14, 12);
    this.disposables.push(elbowCapGeo);
    const elbowCap = new THREE.Mesh(elbowCapGeo, skinMat);
    elbowCap.castShadow = true;
    elbow.add(elbowCap);

    const forearm = new THREE.Group();
    elbow.add(forearm);

    const forearmGeo = new THREE.CylinderGeometry(0.038, 0.027, forearmLen, 18);
    this.disposables.push(forearmGeo);
    const forearmMesh = new THREE.Mesh(forearmGeo, skinMat);
    forearmMesh.position.set(0, -forearmLen / 2, 0);
    forearmMesh.castShadow = true;
    forearmMesh.receiveShadow = true;
    forearm.add(forearmMesh);

    // Wrist pivots
    const wristFlex = new THREE.Group();
    wristFlex.position.set(0, -forearmLen, 0);
    forearm.add(wristFlex);

    const wristTilt = new THREE.Group();
    wristFlex.add(wristTilt);

    const wristCapGeo = new THREE.SphereGeometry(0.025, 12, 10);
    wristCapGeo.scale(0.8, 0.9, 1.15);
    this.disposables.push(wristCapGeo);
    const wristCap = new THREE.Mesh(wristCapGeo, skinMat);
    wristTilt.add(wristCap);

    // Sculpted Palm (extends along -Y, width along Z, thickness along X)
    // Palm inner face points toward -sideSign * X
    const palmLength = 0.088;
    const palmWidth = 0.076;
    const palmThick = 0.024;

    const palmGeo = new THREE.BoxGeometry(palmThick, palmLength, palmWidth);
    this.disposables.push(palmGeo);
    const palmMesh = new THREE.Mesh(palmGeo, skinMat);
    palmMesh.position.set(0, -palmLength / 2, 0);
    palmMesh.castShadow = true;
    palmMesh.receiveShadow = true;
    wristTilt.add(palmMesh);

    // Soft rounded palm bevel/thenar pad on inner palm surface
    const palmPadGeo = new THREE.SphereGeometry(0.034, 14, 12);
    palmPadGeo.scale(0.42, 1.15, 0.96);
    this.disposables.push(palmPadGeo);
    const palmPad = new THREE.Mesh(palmPadGeo, palmInnerMat);
    palmPad.position.set(-sideSign * 0.006, -0.048, 0.01);
    wristTilt.add(palmPad);

    // Knuckle ridge cylinder
    const knuckleBarGeo = new THREE.CapsuleGeometry(0.011, 0.058, 6, 12);
    knuckleBarGeo.rotateX(Math.PI / 2);
    this.disposables.push(knuckleBarGeo);
    const knuckleBar = new THREE.Mesh(knuckleBarGeo, skinMat);
    knuckleBar.position.set(0, -palmLength + 0.004, 0);
    wristTilt.add(knuckleBar);

    // 4 Articulated Fingers (index at +Z thumb side, pinky at -Z outer side)
    const fingerSpecs: Array<{
      key: 'index' | 'middle' | 'ring' | 'pinky';
      zOffset: number;
      lengths: [number, number, number];
      radius: number;
    }> = [
      { key: 'index', zOffset: 0.027, lengths: [0.038, 0.026, 0.02], radius: 0.0092 },
      { key: 'middle', zOffset: 0.009, lengths: [0.042, 0.029, 0.021], radius: 0.0095 },
      { key: 'ring', zOffset: -0.009, lengths: [0.039, 0.026, 0.019], radius: 0.0088 },
      { key: 'pinky', zOffset: -0.027, lengths: [0.031, 0.021, 0.016], radius: 0.0078 },
    ];

    const fingers = {} as Record<'index' | 'middle' | 'ring' | 'pinky', FingerJointRig>;

    for (const spec of fingerSpecs) {
      const mcp = new THREE.Group();
      mcp.position.set(0, -palmLength, spec.zOffset);
      wristTilt.add(mcp);

      const pip = this.addPhalanx(mcp, spec.lengths[0], spec.radius, skinMat);
      const dip = this.addPhalanx(pip, spec.lengths[1], spec.radius * 0.88, skinMat);
      this.addPhalanx(dip, spec.lengths[2], spec.radius * 0.78, skinMat, true);

      fingers[spec.key] = { mcp, pip, dip };
    }

    // Articulated Thumb (2 segments + abduct/oppose saddle joint)
    const abductGroup = new THREE.Group();
    abductGroup.position.set(-sideSign * 0.005, -0.024, 0.035);
    wristTilt.add(abductGroup);

    const opposeGroup = new THREE.Group();
    abductGroup.add(opposeGroup);

    const thumbMcp = new THREE.Group();
    opposeGroup.add(thumbMcp);

    const thumbIp = this.addPhalanx(thumbMcp, 0.033, 0.0102, skinMat);
    this.addPhalanx(thumbIp, 0.026, 0.0088, skinMat, true);

    return {
      sideSign,
      shoulderPitch,
      shoulderRoll,
      shoulderYaw,
      elbow,
      forearm,
      wristFlex,
      wristTilt,
      thumb: { abductGroup, opposeGroup, mcp: thumbMcp, ip: thumbIp },
      fingers,
    };
  }

  private addPhalanx(
    parent: THREE.Group,
    length: number,
    radius: number,
    mat: THREE.Material,
    isTip = false,
  ): THREE.Group {
    const segGeo = new THREE.CapsuleGeometry(radius, Math.max(0.004, length - radius * 1.4), 6, 10);
    this.disposables.push(segGeo);
    const seg = new THREE.Mesh(segGeo, mat);
    seg.position.set(0, -length / 2, 0);
    seg.castShadow = true;
    parent.add(seg);

    const next = new THREE.Group();
    next.position.set(0, -length, 0);
    parent.add(next);

    if (!isTip) {
      const jointGeo = new THREE.SphereGeometry(radius * 0.96, 10, 8);
      this.disposables.push(jointGeo);
      const joint = new THREE.Mesh(jointGeo, mat);
      next.add(joint);
    }

    return next;
  }

  /**
   * Advances spring-damped joint targets, natural breathing, eye blinks, and non-manual markers.
   */
  public update(
    delta: number,
    targetKeyframe: SignKeyframe | null,
    isSigning: boolean,
    activeNmm: NMMType = 'neutral',
  ) {
    const dt = Math.min(delta, 0.05);
    this.elapsed += dt;

    // 1. Subtle idle breathing & live presence
    const breath = Math.sin(this.elapsed * 1.85);
    this.chestMesh.scale.set(1.0 + breath * 0.01, 1.0, 1.0 + breath * 0.018);

    // 2. Natural periodic eye blinking
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blinkAmount = Math.min(1, this.blinkAmount + dt * 14);
      if (this.blinkTimer < -0.14) {
        this.blinkAmount = 0;
        this.blinkTimer = 2.6 + Math.abs(Math.sin(this.elapsed * 1.7)) * 2.4;
      }
    } else {
      this.blinkAmount = THREE.MathUtils.damp(this.blinkAmount, 0, 18, dt);
    }
    const lidRot = -0.68 + this.blinkAmount * 0.72;
    this.leftEyelid.rotation.x = lidRot;
    this.rightEyelid.rotation.x = lidRot;

    // 3. Target poses (either active keyframe or relaxed neutral stance)
    const targetR = targetKeyframe ? targetKeyframe.rightArm : REST_ARM_POSE;
    const targetL = targetKeyframe?.leftArm ? targetKeyframe.leftArm : REST_ARM_POSE;

    const dampRate = isSigning ? 12.5 : 6.5;

    // Smoothly damp arm & hand joints
    this.dampArmState(this.currentRight, targetR, dampRate, dt);
    this.dampArmState(this.currentLeft, targetL, dampRate, dt);

    // Subtle natural idle micro-sway when resting
    const idleHeadYaw = isSigning ? 0 : Math.sin(this.elapsed * 0.7) * 2.0;
    const idleHeadPitch = isSigning ? 0 : Math.sin(this.elapsed * 0.9) * 1.2;

    // 4. Non-manual markers (head & facial expression)
    const effectiveNmm = targetKeyframe?.nmm ?? activeNmm;
    let targetBrowRaise = 0;
    let targetBrowFurrow = 0;
    let targetSmile = 0.12;
    let nmmHeadPitch = 0;
    let nmmHeadYaw = 0;
    let nmmHeadRoll = 0;

    switch (effectiveNmm) {
      case 'question_yn':
        targetBrowRaise = 1;
        nmmHeadPitch = -4;
        nmmHeadRoll = 4;
        targetSmile = 0.05;
        break;
      case 'question_wh':
        targetBrowFurrow = 1;
        nmmHeadPitch = 4;
        nmmHeadRoll = -5;
        targetSmile = -0.05;
        break;
      case 'affirmative':
        targetBrowRaise = 0.35;
        targetSmile = 0.55;
        break;
      case 'negative':
        targetBrowFurrow = 0.65;
        targetSmile = -0.35;
        break;
      case 'happy':
        targetBrowRaise = 0.4;
        targetSmile = 0.85;
        break;
      case 'sad':
        targetBrowFurrow = 0.45;
        targetSmile = -0.65;
        nmmHeadPitch = 6;
        break;
      case 'urgent':
        targetBrowFurrow = 0.8;
        targetSmile = -0.15;
        break;
      default:
        break;
    }

    const targetHeadPitch = (targetKeyframe?.headPitch ?? nmmHeadPitch) + idleHeadPitch;
    const targetHeadYaw = (targetKeyframe?.headYaw ?? nmmHeadYaw) + idleHeadYaw;
    const targetHeadRoll = targetKeyframe?.headRoll ?? nmmHeadRoll;
    const targetTorsoLean = targetKeyframe?.torsoLean ?? 0;
    const targetTorsoTwist = targetKeyframe?.torsoTwist ?? 0;

    this.currentHeadPitch = THREE.MathUtils.damp(this.currentHeadPitch, targetHeadPitch, 10, dt);
    this.currentHeadYaw = THREE.MathUtils.damp(this.currentHeadYaw, targetHeadYaw, 10, dt);
    this.currentHeadRoll = THREE.MathUtils.damp(this.currentHeadRoll, targetHeadRoll, 10, dt);
    this.currentTorsoLean = THREE.MathUtils.damp(this.currentTorsoLean, targetTorsoLean, 9, dt);
    this.currentTorsoTwist = THREE.MathUtils.damp(this.currentTorsoTwist, targetTorsoTwist, 9, dt);
    this.currentBrowRaise = THREE.MathUtils.damp(this.currentBrowRaise, targetBrowRaise, 11, dt);
    this.currentBrowFurrow = THREE.MathUtils.damp(this.currentBrowFurrow, targetBrowFurrow, 11, dt);
    this.currentSmile = THREE.MathUtils.damp(this.currentSmile, targetSmile, 10, dt);

    this.applyRigTransforms();
  }

  private dampArmState(state: InternalArmState, target: ArmPose, rate: number, dt: number) {
    state.shoulderForward = THREE.MathUtils.damp(state.shoulderForward, target.shoulderForward, rate, dt);
    state.shoulderOut = THREE.MathUtils.damp(state.shoulderOut, target.shoulderOut, rate, dt);
    state.shoulderTwist = THREE.MathUtils.damp(state.shoulderTwist, target.shoulderTwist, rate, dt);
    state.elbowFlex = THREE.MathUtils.damp(state.elbowFlex, target.elbowFlex, rate, dt);
    state.forearmPronation = THREE.MathUtils.damp(
      state.forearmPronation,
      target.forearmPronation,
      rate,
      dt,
    );
    state.wristFlex = THREE.MathUtils.damp(state.wristFlex, target.wristFlex, rate, dt);
    state.wristTilt = THREE.MathUtils.damp(state.wristTilt, target.wristTilt, rate, dt);

    const targetHand = HANDSHAPE_POSES[target.handshape] ?? HANDSHAPE_POSES.neutral;
    const fingerRate = rate * 1.35;

    state.hand.thumb.abduct = THREE.MathUtils.damp(
      state.hand.thumb.abduct,
      targetHand.thumb.abduct,
      fingerRate,
      dt,
    );
    state.hand.thumb.oppose = THREE.MathUtils.damp(
      state.hand.thumb.oppose,
      targetHand.thumb.oppose,
      fingerRate,
      dt,
    );
    state.hand.thumb.mcp = THREE.MathUtils.damp(state.hand.thumb.mcp, targetHand.thumb.mcp, fingerRate, dt);
    state.hand.thumb.ip = THREE.MathUtils.damp(state.hand.thumb.ip, targetHand.thumb.ip, fingerRate, dt);

    const keys: Array<Exclude<FingerKey, 'thumb'>> = ['index', 'middle', 'ring', 'pinky'];
    for (const key of keys) {
      state.hand[key].mcp = THREE.MathUtils.damp(state.hand[key].mcp, targetHand[key].mcp, fingerRate, dt);
      state.hand[key].pip = THREE.MathUtils.damp(state.hand[key].pip, targetHand[key].pip, fingerRate, dt);
      state.hand[key].dip = THREE.MathUtils.damp(state.hand[key].dip, targetHand[key].dip, fingerRate, dt);
      state.hand[key].splay = THREE.MathUtils.damp(
        state.hand[key].splay,
        targetHand[key].splay,
        fingerRate,
        dt,
      );
    }
  }

  private applyRigTransforms() {
    this.torsoGroup.rotation.x = this.currentTorsoLean * DEG2RAD;
    this.torsoGroup.rotation.y = this.currentTorsoTwist * DEG2RAD;

    this.headGroup.rotation.x = this.currentHeadPitch * DEG2RAD;
    this.headGroup.rotation.y = this.currentHeadYaw * DEG2RAD;
    this.headGroup.rotation.z = this.currentHeadRoll * DEG2RAD;

    // Eyebrows
    const browY = 0.136 + this.currentBrowRaise * 0.008 - this.currentBrowFurrow * 0.006;
    const browTilt = this.currentBrowFurrow * 0.22 - this.currentBrowRaise * 0.08;
    this.rightBrow.position.y = browY;
    this.leftBrow.position.y = browY;
    this.rightBrow.rotation.z = -browTilt;
    this.leftBrow.rotation.z = browTilt;

    // Mouth expression
    this.mouthMesh.scale.x = 1 + Math.max(0, this.currentSmile) * 0.28;
    this.mouthMesh.position.y = 0.034 + this.currentSmile * 0.003;

    this.applyArmPose(this.rightArm, this.currentRight);
    this.applyArmPose(this.leftArm, this.currentLeft);
  }

  private applyArmPose(rig: ArmRig, state: InternalArmState) {
    const s = rig.sideSign; // -1 for Right (-X), +1 for Left (+X)

    rig.shoulderPitch.rotation.x = -state.shoulderForward * DEG2RAD;
    rig.shoulderRoll.rotation.z = s * state.shoulderOut * DEG2RAD;
    rig.shoulderYaw.rotation.y = -s * state.shoulderTwist * DEG2RAD;

    rig.elbow.rotation.x = -state.elbowFlex * DEG2RAD;
    rig.forearm.rotation.y = -s * state.forearmPronation * DEG2RAD;

    rig.wristFlex.rotation.z = -s * state.wristFlex * DEG2RAD;
    rig.wristTilt.rotation.x = -state.wristTilt * DEG2RAD;

    // Fingers
    const keys: Array<Exclude<FingerKey, 'thumb'>> = ['index', 'middle', 'ring', 'pinky'];
    for (const key of keys) {
      const fRig = rig.fingers[key];
      const fPose = state.hand[key];
      fRig.mcp.rotation.z = -s * fPose.mcp * DEG2RAD;
      fRig.mcp.rotation.x = -fPose.splay * DEG2RAD;
      fRig.pip.rotation.z = -s * fPose.pip * DEG2RAD;
      fRig.dip.rotation.z = -s * fPose.dip * DEG2RAD;
    }

    // Thumb
    rig.thumb.abductGroup.rotation.x = -state.hand.thumb.abduct * DEG2RAD;
    rig.thumb.opposeGroup.rotation.y = -s * state.hand.thumb.oppose * DEG2RAD;
    rig.thumb.mcp.rotation.z = -s * state.hand.thumb.mcp * DEG2RAD;
    rig.thumb.ip.rotation.z = -s * state.hand.thumb.ip * DEG2RAD;
  }

  public dispose() {
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}
