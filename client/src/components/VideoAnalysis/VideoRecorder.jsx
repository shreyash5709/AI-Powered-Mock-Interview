import React, { useEffect, useRef, useState } from 'react';

const VideoRecorder = ({ isRecording, onRecordingComplete }) => {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recordedUrl, setRecordedUrl] = useState(null);

  useEffect(() => {
    if (isRecording) startRecording();
    else stopRecording();
  }, [isRecording]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    chunksRef.current = [];
    recorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      onRecordingComplete?.(blob);
      stream.getTracks().forEach(t => t.stop());
    };
    recorderRef.current.start();
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  return recordedUrl ? <video src={recordedUrl} controls className="w-full rounded-lg" /> : null;
};

export default VideoRecorder;
