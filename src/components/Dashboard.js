import React from "react";
import { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import "../styles/app.scss";
import useAuth from "../useAuth";
import Player from "./Player";

const spotifyApi = new SpotifyWebApi({
  clientId: "a2a42d608819417ebc788bc2abe5d41f",
});

export default function Dashboard(props) {
  const accessToken = useAuth(props.code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  useEffect(() => {
    if (!playingTrack) return;

    axios
      .get("http://localhost:3001/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then((res) => {
        setLyrics(res.data.lyrics);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [playingTrack]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;
    let cancel = false;

    const timer = setTimeout(() => {
      spotifyApi.searchTracks(search).then((res) => {
        if (cancel) return;

        setSearchResults(
          res.body.tracks.items.map((track) => {
            const smallestAlbumImage = track.album.images.reduce(
              (smallest, image) => {
                if (image.height < smallest.height) return image;
                return smallest;
              },
              track.album.images[0]
            );

            return {
              artist: track.artists[0].name,
              title: track.name,
              uri: track.uri,
              albumUrl: smallestAlbumImage.url,
            };
          })
        );
      });
    }, 500);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [search, accessToken]);

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search Songs/Artists"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div
        className="flex-grow-1 my-2"
        style={{ overflowY: "auto", color: "white" }}
      >
        {searchResults.map((track) => {
          const handlePlay = () => {
            chooseTrack(track);
          };
          return (
            <div key={track.uri} track={track} chooseTrack={chooseTrack}>
              <div
                className="d-flex m2 align-items-center"
                style={{ cursor: "pointer" }}
                onClick={handlePlay}
              >
                <img
                  src={track.albumUrl}
                  style={{ height: "64px", width: "64px", marginRight: "1em" }}
                  alt="imahe"
                />
                <div className="ml-3">
                  <div>{track.title}</div>
                  <div>{track.artist}</div>
                </div>
              </div>
            </div>
          );
        })}
        {searchResults.length === 0 && (
          <div
            className="text-center"
            style={{ whiteSpace: "pre", color: "white" }}
          >
            {lyrics}
          </div>
        )}
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
}
