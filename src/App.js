import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-js";
import "./App.css";
import UserPage from "./components/UserPage";
import LandingPage from "./components/LandingPage";
import NavBar from "./components/NavBar";
import ArtistPage from "./components/ArtistPage";
import TrackPage from "./components/TrackPage";
import styled from "styled-components";

const spotify = new SpotifyWebApi();

const Header = styled.header`
  width: 100%;
  position: sticky;
  top: 0;
`;

const Content = styled.div`
  background: linear-gradient(90deg, rgba(18,18,18,1) 0%, rgba(33,33,33,1) 50%, rgba(18,18,18,1) 100%);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;

`;

const Button = styled.button`
  margin-top: 3rem;
`;

function App() {
  // const [spotifyToken, setSpotifyToken] = useState("")
  const initialUserProfile = {
    display_name: "",
    images: [{ url: "" }],
    external_urls: { spotify: "" },
  };

  const initialCurrentlyPlaying = {
    item: {
      name: "",
      artists: [{ name: "" }],
    },
  };

  const [token, setToken] = useState("");
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(
    initialCurrentlyPlaying
  );
  const [numberArtistsFollowing, setNumberArtistsFollowing] = useState(0);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");
    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];
      window.location.hash = "";
      window.localStorage.setItem("token", token);
      setToken(token);
      spotify.setAccessToken(token);
      spotify.getMyTopTracks().then((user) => {
        console.log("Top Tracks:", user);
      });
      spotify.getMyRecentlyPlayedTracks().then((user) => {
        console.log("Recent Tracks:", user);
      });
      spotify.getMySavedAlbums().then((user) => {
        console.log("Saved albums:", user);
      });
      spotify.getFollowedArtists().then((user) => {
        setNumberArtistsFollowing(user.artists.total);
      });

      spotify.getMyCurrentPlayingTrack().then((data) => {
        if (data) {
          setCurrentlyPlaying(data);
        }
      });

      spotify.getMe().then(setUserProfile);
    }
    setToken(token);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    setUserProfile(initialUserProfile);
  };

  return (
    <>
      <Header>
        {userProfile.display_name ? (
          <NavBar username={userProfile.display_name} logout={logout} />
        ) : null}
      </Header>
      <Content>
        {!token ? <LandingPage /> : <Button onClick={logout}>Logout</Button>}

        <Routes>
          <Route
            path="/"
            element={
              <UserPage
                numberArtistsFollowing={numberArtistsFollowing}
                currentlyPlaying={currentlyPlaying}
                user={userProfile}
              />
            }
          />
        </Routes>
        <Routes>
          <Route path="/artists" element={<ArtistPage spotify={spotify} />} />
          <Route path="/tracks" element={<TrackPage spotify={spotify} />} />
        </Routes>
      </Content>
    </>
  );
}

export default App;
