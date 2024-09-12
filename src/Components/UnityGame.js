import { useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import {
  BackGroundImage,
  BackGroundImageWatch,
  GameContainer,
  InputField,
  PocatRushButton,
  Wrapper,
} from "../Style/StyledComponents";

import {
  tokenCheck,
  tokenCheckGetUserId,
  urlCheckDevice,
  urlCheckNickNameOverLap,
  urlCreateCharacter,
  urlExpUpdate,
  urlGetCharacter,
  urlGetItemData,
  urlHpUpdateByNickname,
  urlItemUpdate,
  urlJoinDevice,
  urlKgUpdate,
  urlKmUpdate,
  urlMinUpdate,
  urlNPCLikeUpdate,
  urlPlusData,
} from "../API/api";
import Header from "./Header";
import Footer from "./Footer";
import { Link } from "react-router-dom";

export function UnityGame() {
  const { unityProvider, sendMessage, addEventListener, removeEventListener } =
    useUnityContext({
      loaderUrl: "build/PocatRush.loader.js",
      dataUrl: "build/PocatRush.data",
      frameworkUrl: "build/PocatRush.framework.js",
      codeUrl: "build/PocatRush.wasm",
    });

  // 로딩완료시 첫 실행코드 할당하기
  const [playingGame, setPlayingGame] = useState(false);
  const [worldReady, setWorldReady] = useState(false);

  // 캐릭터만들기
  const [userId, setUserId] = useState("");
  const [charNickname, setCharNickname] = useState("");
  const [inputCharNickname, setInputCharNickname] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const characterData = {
    charNickName: `${charNickname}`,
    user: `${userId}`,
    profileImage: `${profileImage}`,
  };

  // 디바이스 관리 (운동정보)
  const [deviceKm, setDeviceKm] = useState("");
  const [deviceKg, setDeviceKg] = useState("");
  const [deviceMin, setDeviceMin] = useState("");
  const [resetKm, setResetKm] = useState(0);
  const [resetKg, setResetKg] = useState(0);
  const [resetMin, setResetMin] = useState(0);

  // 캐릭터 정보 관리
  const [character, setCharacter] = useState("");
  const [characterHp, setCharacterHp] = useState("");
  const [characterLevel, setCharacterLevel] = useState("");
  const [exp, setExp] = useState(0);
  const [newHp, setNewHp] = useState("");

  // 캐릭터 아이템 관리
  const [churuValue, setChuruValue] = useState(0);
  const [coinValue, setCoinValue] = useState(0);
  const churuData = {
    charNickName: `${charNickname}`,
    itemId: `id_churu`,
    itemValue: `${churuValue}`,
  };
  const coinData = {
    charNickName: `${charNickname}`,
    itemId: `id_gameShopCoin`,
    itemValue: `${coinValue}`,
  };

  async function getUserId() {
    try {
      const response = await tokenCheck();
      setUserId(response.userId);
      try {
        const responseCharData = await urlGetCharacter(response.userId);
        try {
          const responseItemData = await urlGetItemData(
            responseCharData.data.data.charNickName
          );
          console.log("아이템 정보는 ?  : ", responseItemData.data);
          setChuruValue(
            responseItemData.data
              .filter((i) => i.itemId == "id_churu")
              .map((i) => i.itemValue)[0]
          );
          setCoinValue(
            responseItemData.data
              .filter((i) => i.itemId == "id_gameShopCoin")
              .map((i) => i.itemValue)[0]
          );
        } catch (error) {
          console.log("아이템 불러오기 에러 : ", error);
        }

        console.log("캐릭터가 있습니다", responseCharData.data);
        console.log("캐릭터 정보는? : ", responseCharData.data.data);

        setCharacterHp(responseCharData.data.data.charHp);
        setCharacterLevel(responseCharData.data.data.level.levelId);
        setCharNickname(responseCharData.data.data.charNickName);

        sendMessage(
          "SceneManager",
          "isUser",
          responseCharData.data.data.charNickName
        );
      } catch (error) {
        console.log("캐릭터가 없습니다", error);
      }
    } catch (error) {
      console.log("tokenCheck 에러 : ", error);
    }
  }

  async function checkNickNameOverLap() {
    try {
      const checkOverlapResponse = await urlCheckNickNameOverLap(
        inputCharNickname
      );
      console.log("checkOverlapResponse : ", checkOverlapResponse.data);
      if (checkOverlapResponse.data == "FOUND") {
        sendMessage("createButton", "nickNameFound");
        return;
      } else if (checkOverlapResponse.data == "NOT_FOUND") {
        setCharNickname(inputCharNickname);
      }
    } catch (error) {
      console.log("닉네임 중복체크 에러 : ", error);
    }
  }

  async function createCharater() {
    try {
      const responseCreated = await urlCreateCharacter(characterData);
      console.log("urlCreateCharacter : ", responseCreated);
      sendMessage("createButton", "Show");
      getUserId();
    } catch (error) {
      console.log("urlCreateCharacter 에러 ", error);
    }
  }

  async function charExpUpdate() {
    if (!exp) {
      return;
    }
    try {
      const response = await urlExpUpdate(charNickname, exp);
      console.log("경험치 저장 완료 : ", response.data);
      sendMessage("userPanel", "GetLevel", response.data);
    } catch (error) {
      console.log("경험치 저장 에러 : ", error);
    }
  }

  async function hpUpdate() {
    try {
      const responseHpUpdate = await urlHpUpdateByNickname(charNickname, newHp);
      console.log("HP 업데이트 완료 : ", responseHpUpdate.data);
    } catch (error) {
      console.log("HP 업데이트 에러 : ", error);
    }
  }

  async function itemValueUpdate() {
    if (churuValue == null && coinValue == null) {
      console.log("츄르랑 코인이 왜 없누? ", churuValue + " : " + coinValue);
      return;
    }
    try {
      const responseChuruUpdate = await urlItemUpdate(churuData);
      const responseCoinUpdate = await urlItemUpdate(coinData);
      console.log(
        "츄르,코인 업데이트 성공 : ",
        responseChuruUpdate.data,
        " , ",
        responseCoinUpdate.data
      );
    } catch (error) {
      console.log("츄르 혹은 코인 에러 : ", error);
    }
  }

  async function kmReset() {
    if (!userId) {
      return;
    }
    try {
      const response = await urlKmUpdate(userId, resetKm);
    } catch (error) {
      console.log("kmUpdate 에러 : ", error);
    }
  }
  async function kgReset() {
    if (!userId) {
      return;
    }
    const response = await urlKgUpdate(userId, resetKg);
    try {
    } catch (error) {
      console.log("kgUpdate 에러 : ", error);
    }
  }
  async function minReset() {
    if (!userId) {
      return;
    }
    const response = await urlMinUpdate(userId, resetMin);
    try {
    } catch (error) {
      console.log("minUpdate 에러 : ", error);
    }
  }

  async function checkDevice() {
    try {
      const response = await urlCheckDevice(userId);
      console.log("월드 진입 운동정보 갱신 : ", response.data);
      setDeviceKm(response.data.km);
      setDeviceKg(response.data.kg);
      setDeviceMin(response.data.min);
    } catch (error) {
      console.log("운동정보 갱신 실패 : ", error);
      sendMessage("GameManager", "deviceNotCreated");
    }
  }

  function handleCharacterData(nickName) {
    setInputCharNickname(nickName);
  }

  function handleGameReady(gameReady) {
    setPlayingGame(true);
  }

  function handleWorldReady() {
    setWorldReady(true);
  }
  function handleExpUpdateData(exp) {
    setExp(exp);
  }

  function handleKmResetData(km) {
    setResetKm(km);
  }
  function handleKgResetData(kg) {
    setResetKg(kg);
  }
  function handleMinResetData(min) {
    setResetMin(min);
  }

  function handleHpUpdateData(newHp) {
    setNewHp(newHp);
  }

  function handleItemValueUpdateData(nowChuruValue, nowCoinValue) {
    setChuruValue(nowChuruValue);
    setCoinValue(nowCoinValue);
  }

  useEffect(() => {
    addEventListener("ExpUpdate", handleExpUpdateData);
    return () => {
      removeEventListener("ExpUpdate", handleExpUpdateData);
    };
  }, [addEventListener, removeEventListener ,handleExpUpdateData]);

  useEffect(() => {
    addEventListener("Create", handleCharacterData);
    return () => {
      removeEventListener("Create", handleCharacterData);
    };
  }, [addEventListener, removeEventListener ,handleCharacterData]);

  useEffect(() => {
    addEventListener("GameReady", handleGameReady);
    return () => {
      removeEventListener("GameReady", handleGameReady);
    };
  }, [addEventListener, removeEventListener ,handleGameReady]);

  useEffect(() => {
    addEventListener("WorldReady", handleWorldReady);
    console.log("포켓월드 시작!");
    return () => {
      removeEventListener("WorldReady", handleWorldReady);
    };
  }, [addEventListener, removeEventListener ,handleWorldReady]);

  useEffect(() => {
    addEventListener("kmReset", handleKmResetData);
    return () => {
      console.log("kmReset removed");
      removeEventListener("kmReset", handleKmResetData);
    };
  }, [addEventListener, removeEventListener ,handleKmResetData]);

  useEffect(() => {
    addEventListener("kgReset", handleKgResetData);
    return () => {
      console.log("kgReset removed");
      removeEventListener("kgReset", handleKgResetData);
    };
  }, [addEventListener, removeEventListener ,handleKgResetData]);

  useEffect(() => {
    addEventListener("minReset", handleMinResetData);
    return () => {
      console.log("minReset removed");
      removeEventListener("minReset", handleMinResetData);
    };
  }, [addEventListener, removeEventListener ,handleMinResetData]);

  useEffect(() => {
    addEventListener("HpUpdate", handleHpUpdateData);
    return () => {
      console.log("HpUpdate removed");
      removeEventListener("HpUpdate", handleHpUpdateData);
    };
  }, [addEventListener, removeEventListener ,handleHpUpdateData]);

  useEffect(() => {
    addEventListener("ItemValueUpdate", handleItemValueUpdateData);
    return () => {
      console.log("ItemValueUpdate removed");
      removeEventListener("ItemValueUpdate", handleItemValueUpdateData);
    };
  }, [addEventListener, removeEventListener ,handleItemValueUpdateData]);

  useEffect(() => {
    getUserId();
  }, [playingGame]);

  useEffect(() => {
    checkDevice();
    sendMessage("userPanel", "GetNickName", charNickname);
    sendMessage("userPanel", "GetHp", characterHp);
    sendMessage("userPanel", "GetLevel", characterLevel);
    sendMessage("ItemPanel", "GetChuruValueByCharacter", churuValue);
    sendMessage("ItemPanel", "GetCoinValueByCharacter", coinValue);
  }, [worldReady]);

  useEffect(() => {
    if (deviceKm == -1 && deviceKg == -1 && deviceMin == -1) {
      return;
    }
    sendMessage("GameManager", "kmUpdate", deviceKm);
    sendMessage("GameManager", "kgUpdate", deviceKg);
    sendMessage("GameManager", "minUpdate", deviceMin);
  }, [deviceKm, deviceKg, deviceMin]);

  useEffect(() => {
    createCharater();
  }, [charNickname]);

  useEffect(() => {
    checkNickNameOverLap();
  }, [inputCharNickname]);

  useEffect(() => {
    if (!exp) {
      return;
    }
    charExpUpdate();
  }, [exp]);

  useEffect(() => {
    if (!userId) {
      console.log("userId 없음");
      return;
    }
    kmReset();
  }, [resetKm]);

  useEffect(() => {
    if (!userId) {
      console.log("userId 없음");
      return;
    }
    kgReset();
  }, [resetKg]);

  useEffect(() => {
    if (!userId) {
      console.log("userId 없음");
      return;
    }
    minReset();
  }, [resetMin]);

  useEffect(() => {
    if (!charNickname) {
      console.log("charNickname 없음");
      return;
    }
    itemValueUpdate();
  }, [churuValue, coinValue]);
  
  useEffect(() => {
    if (!newHp) {
      console.log("newHp 없음");
      return;
    }
    hpUpdate();
    
  }, [newHp]);
  // 테스트
  useEffect(() => {
    console.log("가진 츄르 갯수 : ", churuValue);
    console.log("가진 코인 갯수 : ", coinValue);
  }, [churuValue]);


  //적용하기-진경
  const [deviceFound, setDeviceFound] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [inputKm, setInputKm] = useState(0);
  const [inputKg, setInputKg] = useState(0);
  const [inputMin, setInputMin] = useState(0);
  const plusUpdate = {
    deviceId: `${deviceId}`,
    km: `${inputKm}`,
    kg: `${inputKg}`,
    min: `${inputMin}`,
  };
  
  async function plusDeviceData() {
    if (window.confirm("운동량이 더해집니다. 계속 하시겠습니까?")) {
      console.log(plusUpdate);
      try {
        const response = await urlPlusData(plusUpdate);
        console.log("plusUpdateData : ", response.data);
        setDeviceFound({
          km: response.data.km,
          kg: response.data.kg,
          min: response.data.min,
        });
      } catch (error) {
        console.log("에러 : ", error);
      }
    }
  }

  return (
    <>
      <Header></Header>

      <BackGroundImage bgImg={`url("../images/background_game.png")`}>
        <Wrapper overflow={"none"}>
          <Wrapper
            display={"flex"}
            dr={"row"}
            ju={"center"}
            wrap={"nowrap"}
            alContent={"center"}
            al={" center"}
            overflow={"none"}
          >
            <div>
              <GameContainer>
                {
                  <Unity
                    unityProvider={unityProvider}
                    style={{
                      width: "100%",
                      height: "100%",
                      //marginTop: "70px",
                      boxShadow: "0px 0px 20px #888",
                    }}
                  />
                }
              </GameContainer>
              {/* <button>
          <Link to="/linerider" target="_blank">
            라인라이더
          </Link>
        </button> */}
            </div>

            <BackGroundImageWatch bgImg={`url("../images/watch02.png")`}>
              <Wrapper
                dr={`column`}
                alContent={`center`}
                ju={`center`}
                al={`center`}
                margin={` 165px 0`}

              >

                
                <InputField
                type="number"
                  width={`40px`}
                  height={`20px`}
                  background={`none`}
                  borderbottom={`1px solid #f37d7f`}
                  margin={`5px`}
                
                  placeholder="km"
                  value={inputKm}
                  onChange={(e) => setInputKm(e.target.value)}
                />
                <InputField
                type="number"
                  width={`40px`}
                  height={`20px`}
                  background={`none`}
                  borderbottom={`1px solid #f37d7f`}
                  margin={`3px`}
                  placeholder="입력"
                  value={inputKg}
                  onChange={(e) => setInputKg(e.target.value)}
                />
                <InputField
                type="number"
                  width={`40px`}
                  height={`20px`}
                  background={`none`}
                  borderbottom={`1px solid #f37d7f`}
                  margin={`5px`}
                  placeholder="입력"
                  value={inputMin}
                  onChange={(e) => setInputMin(e.target.value)}
                />
                <Wrapper
                  ju={`center`}
                  //margin={`250px 0 0`}
                >
                  <PocatRushButton
                    wid={`50px`}
                    hei={`20px`}
                    fontweight={`0`}
                    margin={`8px`}
                    onClick={() => plusDeviceData()}
                  >
                    적용
                  </PocatRushButton>
                </Wrapper>
              </Wrapper>
            </BackGroundImageWatch>
          </Wrapper>
        </Wrapper>
      </BackGroundImage>
      <Footer></Footer>
    </>
  );
}
