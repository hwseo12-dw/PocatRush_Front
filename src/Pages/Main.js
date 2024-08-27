import { useEffect, useState } from "react";
import Footer from "../Components/Footer";
import GameInformation from "../Components/GameInformation";
import Header from "../Components/Header";
import Profile from "../Components/Profile";
import SmallTable from "../Components/SmallTable";
import {
  GameStartButton,
  Image,
  SmallTableTd,
  SmallTableTr,
  SmallTableWrapper,
  StyledLink,
  Text,
  Wrapper,
} from "../Style/StyledComponents";
import { useNavigate } from "react-router-dom";

function Main() {

  const navigate = useNavigate();

  function loginCheck() {
    let token = localStorage.getItem("JWT-token");
    if(token)
    {
      navigate(`/playgame`)
    } else {
      alert("로그인이 필요합니다.")
    }
  }

  return (
    <>
      <Header />
      <Wrapper ju={`center`} al={`flex-end`} dr={`column`}>
        <Image src="/images/testBanner.png" />
        <Wrapper dr={`column`} al={`flex-end`} isAbsolute top={`32%`}>
          <GameStartButton onClick={() => loginCheck()}>
            GAME START
          </GameStartButton>
          <Profile />
        </Wrapper>
      </Wrapper>
      <SmallTable />
      <GameInformation />

      <Footer />
    </>
  );
}

export default Main;
