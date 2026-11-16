import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { CameraPreset, SignKeyframe } from '../types/isl';
import type { PlaybackStep } from '../utils/islPlayback';
import { ISLAvatar } from './ISLAvatar';
import { createContactShadowTexture, createStageFloorTexture } from './proceduralTextures';

interface ISLStageProps {
  steps: PlaybackStep[];
  isPlaying: boolean;
  speed: number;
  cameraPreset: CameraPreset;
  cameraResetNonce: number;
  jumpToStepNonce: { stepIndex: number; nonce: number } | null;
  onActiveStepChange: (stepIndex: number, step: PlaybackStep | null) => void;
  onPlaybackComplete: () => void;
}

const CAMERA_PRESETS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  upper_body: { pos: [0, 1.38, 1.58], target: [0, 1.24, 0.08] },
  hands_focus: { pos: [0, 1.24, 0.98], target: [0, 1.18, 0.16] },
  face_nmm: { pos: [0, 1.62, 0.9], target: [0, 1.56, 0.06] },
};

const _camTargetPos = new THREE.Vector3();
const _ctrlTargetPos = new THREE.Vector3();

export function ISLStage({
  steps,
  isPlaying,
  speed,
  cameraPreset,
  cameraResetNonce,
  jumpToStepNonce,
  onActiveStepChange,
  onPlaybackComplete,
}: ISLStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Store latest props in refs so WebGL scene never tears down on React state updates
  const stepsRef = useRef<PlaybackStep[]>(steps);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const speedRef = useRef<number>(speed);
  const onActiveStepChangeRef = useRef(onActiveStepChange);
  const onPlaybackCompleteRef = useRef(onPlaybackComplete);

  stepsRef.current = steps;
  isPlayingRef.current = isPlaying;
  speedRef.current = speed;
  onActiveStepChangeRef.current = onActiveStepChange;
  onPlaybackCompleteRef.current = onPlaybackComplete;

  const playbackCursorRef = useRef<{
    stepIndex: number;
    elapsedInStep: number;
    lastReportedStep: number;
  }>({
    stepIndex: 0,
    elapsedInStep: 0,
    lastReportedStep: -1,
  });

  const cameraGoalRef = useRef<{
    active: boolean;
    pos: [number, number, number];
    target: [number, number, number];
  }>({
    active: false,
    pos: CAMERA_PRESETS.upper_body.pos,
    target: CAMERA_PRESETS.upper_body.target,
  });

  // Reset cursor when steps array identity changes
  useEffect(() => {
    playbackCursorRef.current = {
      stepIndex: 0,
      elapsedInStep: 0,
      lastReportedStep: -1,
    };
    if (steps.length > 0) {
      onActiveStepChangeRef.current(0, steps[0]);
      playbackCursorRef.current.lastReportedStep = 0;
    } else {
      onActiveStepChangeRef.current(-1, null);
    }
  }, [steps]);

  // Handle jump-to-step clicks from timeline
  useEffect(() => {
    if (!jumpToStepNonce) return;
    const idx = Math.max(0, Math.min(jumpToStepNonce.stepIndex, stepsRef.current.length - 1));
    playbackCursorRef.current.stepIndex = idx;
    playbackCursorRef.current.elapsedInStep = 0;
    playbackCursorRef.current.lastReportedStep = idx;
    onActiveStepChangeRef.current(idx, stepsRef.current[idx] ?? null);
  }, [jumpToStepNonce]);

  // Smooth camera preset transitions
  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset];
    cameraGoalRef.current = {
      active: true,
      pos: preset.pos,
      target: preset.target,
    };
  }, [cameraPreset, cameraResetNonce]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1120');
    scene.fog = new THREE.Fog('#0b1120', 4.5, 11);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 30);
    camera.position.set(...CAMERA_PRESETS.upper_body.pos);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // Mandatory studio environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#bfd9ff', '#1e293b', 0.82);
    hemiLight.position.set(0, 6, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#fff2e0', 1.85);
    keyLight.position.set(2.2, 3.2, 2.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.camera.left = -1.6;
    keyLight.shadow.camera.right = 1.6;
    keyLight.shadow.camera.top = 2.2;
    keyLight.shadow.camera.bottom = -0.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#93c5fd', 0.72);
    fillLight.position.set(-2.4, 2.0, 1.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#e2e8f0', 0.95);
    rimLight.position.set(-0.6, 2.5, -2.5);
    scene.add(rimLight);

    // Studio floor disc + contact shadow grounding
    const floorTex = createStageFloorTexture();
    floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const floorGeo = new THREE.CircleGeometry(4.2, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.88,
      metalness: 0.06,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const contactTex = createContactShadowTexture();
    const contactGeo = new THREE.PlaneGeometry(1.1, 1.1);
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMesh.rotation.x = -Math.PI / 2;
    contactMesh.position.y = 0.004;
    scene.add(contactMesh);

    // Build Articulated Human ISL Avatar
    const avatar = new ISLAvatar();
    scene.add(avatar.root);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.upper_body.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.65;
    controls.maxDistance = 3.6;
    controls.maxPolarAngle = Math.PI * 0.55;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.enablePan = false;
    controls.update();

    const cancelPresetGoal = () => {
      cameraGoalRef.current.active = false;
    };
    controls.addEventListener('start', cancelPresetGoal);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const resolveKeyframeForStep = (step: PlaybackStep, elapsedInStep: number): SignKeyframe => {
      const total = Math.max(0.25, step.sign.duration / Math.max(0.4, speedRef.current));
      const ratio = Math.min(0.999, elapsedInStep / total);
      const totalWeight = step.sign.keyframes.reduce((acc, k) => acc + k.durationRatio, 0) || 1;
      let acc = 0;
      for (const kf of step.sign.keyframes) {
        acc += kf.durationRatio / totalWeight;
        if (ratio <= acc) return kf;
      }
      return step.sign.keyframes[step.sign.keyframes.length - 1];
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);

      // Camera preset damping
      if (cameraGoalRef.current.active) {
        _camTargetPos.set(...cameraGoalRef.current.pos);
        _ctrlTargetPos.set(...cameraGoalRef.current.target);
        const alpha = 1 - Math.exp(-7 * delta);
        camera.position.lerp(_camTargetPos, alpha);
        controls.target.lerp(_ctrlTargetPos, alpha);
        if (
          camera.position.distanceTo(_camTargetPos) < 0.008 &&
          controls.target.distanceTo(_ctrlTargetPos) < 0.008
        ) {
          cameraGoalRef.current.active = false;
        }
      }
      controls.update();

      // Advance ISL playback sequence
      const activeSteps = stepsRef.current;
      const cursor = playbackCursorRef.current;
      let targetKeyframe: SignKeyframe | null = null;
      let activeNmm = activeSteps[cursor.stepIndex]?.nmm ?? 'neutral';

      if (activeSteps.length > 0 && cursor.stepIndex < activeSteps.length) {
        const currentStep = activeSteps[cursor.stepIndex];
        const stepDuration = Math.max(0.25, currentStep.sign.duration / Math.max(0.4, speedRef.current));

        if (isPlayingRef.current) {
          cursor.elapsedInStep += delta;
          if (cursor.elapsedInStep >= stepDuration) {
            cursor.elapsedInStep -= stepDuration;
            cursor.stepIndex += 1;

            if (cursor.stepIndex >= activeSteps.length) {
              cursor.stepIndex = activeSteps.length - 1;
              cursor.elapsedInStep = stepDuration * 0.95;
              onPlaybackCompleteRef.current();
            } else if (cursor.lastReportedStep !== cursor.stepIndex) {
              cursor.lastReportedStep = cursor.stepIndex;
              onActiveStepChangeRef.current(cursor.stepIndex, activeSteps[cursor.stepIndex]);
            }
          }
        }

        const stepToRender = activeSteps[cursor.stepIndex];
        if (stepToRender) {
          targetKeyframe = resolveKeyframeForStep(stepToRender, cursor.elapsedInStep);
          activeNmm = stepToRender.nmm;
        }
      }

      avatar.update(delta, targetKeyframe, isPlayingRef.current && activeSteps.length > 0, activeNmm);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', cancelPresetGoal);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      avatar.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      floorTex.dispose();
      contactGeo.dispose();
      contactMat.dispose();
      contactTex.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full select-none">
      <div ref={mountRef} className="h-full w-full" aria-label="3D Indian Sign Language Avatar Viewport" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 text-center p-6">
          <div className="max-w-sm space-y-2">
            <p className="text-base font-semibold text-slate-100">3D Viewport Paused</p>
            <p className="text-sm text-slate-400">
              WebGL rendering context was interrupted and is restoring automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
