import React from "react";
import { useState, useEffect } from "react";

import SpotifyPlayer from "react-spotify-web-playback";

export default function Player({ accessToken, trackUri }) {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    setPlay(true);
  }, [trackUri, play]);

  return (
    <div>
      <SpotifyPlayer
        styles={{ color: "white", backgroundColor: "black" }}
        token={accessToken}
        showSaveIcon
        callback={(state) => {
          if (!state.isPlaying) setPlay(false);
        }}
        play={true}
        uris={trackUri ? [trackUri] : []}
      />
    </div>
  );
}
