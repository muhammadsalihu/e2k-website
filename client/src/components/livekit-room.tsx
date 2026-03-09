import { useState, useCallback } from "react";
import {
  LiveKitRoom,
  VideoTrack,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, createLocalVideoTrack } from "livekit-client";
import { Button } from "@/components/ui/button";
import { SwitchCamera, Mic, MicOff, Video, VideoOff } from "lucide-react";

interface LiveKitStreamProps {
  token: string;
  serverUrl: string;
  isHost: boolean;
}

export function LiveKitStream({ token, serverUrl, isHost }: LiveKitStreamProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={isHost}
      audio={isHost}
      data-lk-theme="default"
      className="w-full h-full"
    >
      <StreamContent isHost={isHost} />
    </LiveKitRoom>
  );
}

function StreamContent({ isHost }: { isHost: boolean }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const videoTrack = tracks.find(
    (t) => t.source === Track.Source.Camera && t.publication?.track
  );

  if (isHost) {
    return <HostView />;
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative">
      {videoTrack?.publication?.track ? (
        <VideoTrack
          trackRef={videoTrack}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="text-white/50 text-center">
          <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Waiting for host video...</p>
        </div>
      )}
    </div>
  );
}

function HostView() {
  const { localParticipant } = useLocalParticipant();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const myVideoTrack = tracks.find(
    (t) =>
      t.participant.identity === localParticipant.identity &&
      t.source === Track.Source.Camera &&
      t.publication?.track
  );

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      await localParticipant.setCameraEnabled(false);
    } else {
      await localParticipant.setCameraEnabled(true);
    }
    setIsCameraOn(!isCameraOn);
  }, [isCameraOn, localParticipant]);

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      await localParticipant.setMicrophoneEnabled(false);
    } else {
      await localParticipant.setMicrophoneEnabled(true);
    }
    setIsMicOn(!isMicOn);
  }, [isMicOn, localParticipant]);

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);

    const newTrack = await createLocalVideoTrack({
      facingMode: newMode,
    });
    await localParticipant.publishTrack(newTrack);
  }, [facingMode, localParticipant]);

  return (
    <div className="w-full h-full bg-black relative">
      {myVideoTrack?.publication?.track ? (
        <VideoTrack
          trackRef={myVideoTrack}
          className="w-full h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white/50 text-center">
            <VideoOff className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Camera is off</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        <Button
          size="icon"
          variant={isMicOn ? "secondary" : "destructive"}
          className="rounded-full w-10 h-10"
          onClick={toggleMic}
          data-testid="button-toggle-mic"
        >
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button
          size="icon"
          variant={isCameraOn ? "secondary" : "destructive"}
          className="rounded-full w-10 h-10"
          onClick={toggleCamera}
          data-testid="button-toggle-camera"
        >
          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full w-10 h-10"
          onClick={switchCamera}
          data-testid="button-switch-camera"
        >
          <SwitchCamera className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
