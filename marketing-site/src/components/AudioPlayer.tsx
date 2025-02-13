// src/components/AudioPlayer.tsx
import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

interface AudioPlayerProps {
  src: string;
  onPlay?: () => void;
}

const MyAudioPlayer: React.FC<AudioPlayerProps> = ({ src, onPlay }) => (
  <AudioPlayer
    src={src}
    autoPlay={false}
    onPlay={onPlay || (() => console.log('Playing'))}
  />
);

export default MyAudioPlayer;