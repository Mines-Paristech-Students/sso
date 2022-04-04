import React from "react";
import Image from "react-bootstrap/Image";
import logoMines from "../static/logo_mines.png";

type Props = {
  heading?: any;
  children?: any;
};

export default function MainContainer(props: Props) {
  return (
    <div className="MainContainer">
      {props.heading && (
        <header>
          <Image
            src={logoMines}
            alt="Logo des Mines"
            rounded
            className="logoMines"
          />
          <h1>{props.heading}</h1>
        </header>
      )}

      <div className="content">{props.children}</div>
    </div>
  );
}
