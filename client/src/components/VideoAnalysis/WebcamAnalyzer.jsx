import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WebcamAnalyzer = ({ onMetricsUpdate, isActive }) => {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const statsRef = useRef({ totalFrames: 0, eyeContactFrames: 0, smileFrames: 0, lookAwayFrames: 0 });
  const [metrics, setMetrics] = useState({ eyeContact: 0, smileScore: 0, attentionScore: 0 });

  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );
      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    };
    init();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictLoop);
      }
    };
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    };
  }, [isActive]);

  const predictLoop = () => {
    if (!landmarkerRef.current || !videoRef.current) return;
    const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
    statsRef.current.totalFrames++;

    if (results.faceBlendshapes?.length > 0) {
      const bs = results.faceBlendshapes[0].categories;
      const lookDown = bs.find(b => b.categoryName === 'eyeLookDownLeft')?.score || 0;
      const lookLeft = bs.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
      const lookRight = bs.find(b => b.categoryName === 'eyeLookOutRight')?.score || 0;
      
      if (lookDown < 0.3 && lookLeft < 0.4 && lookRight < 0.4) statsRef.current.eyeContactFrames++;
      else statsRef.current.lookAwayFrames++;

      const smileL = bs.find(b => b.categoryName === 'mouthSmileLeft')?.score || 0;
      const smileR = bs.find(b => b.categoryName === 'mouthSmileRight')?.score || 0;
      if ((smileL + smileR) / 2 > 0.3) statsRef.current.smileFrames++;

      if (statsRef.current.totalFrames % 30 === 0) {
        const s = statsRef.current;
        const newMetrics = {
          eyeContact: Math.round((s.eyeContactFrames / s.totalFrames) * 100),
          smileScore: Math.round((s.smileFrames / s.totalFrames) * 100),
          attentionScore: Math.round(((s.totalFrames - s.lookAwayFrames) / s.totalFrames) * 100),
        };
        setMetrics(newMetrics);
        onMetricsUpdate?.(newMetrics);
      }
    }
    animationRef.current = requestAnimationFrame(predictLoop);
  };

  return (
    <div className="relative">
      <video ref={videoRef} autoPlay playsInline className="rounded-lg w-full" />
      {isActive && (
        <div className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded text-xs space-y-1">
          <div>👁️ Eye Contact: {metrics.eyeContact}%</div>
          <div>😊 Smile: {metrics.smileScore}%</div>
          <div>🎯 Attention: {metrics.attentionScore}%</div>
        </div>
      )}
    </div>
  );
  
};

export default WebcamAnalyzer;
